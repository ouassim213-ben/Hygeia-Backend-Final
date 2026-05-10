from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import pandas as pd
import numpy as np
import io
import base64
from PIL import Image
import cv2
import torch

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. تحميل الموديل والبيانات الغذائية
try:
    # تأكد أن ملف الموديل بهذا الاسم في مجلد المشروع
    model = YOLO("best.pt", task='segment')
    
    # قراءة ملف الميتا داتا
    df_nutri = pd.read_csv("ingredients_metadata.csv")
    
    # تنظيف البيانات لضمان مطابقة البحث
    df_nutri['ingr_name'] = df_nutri['ingr_name'].str.strip().str.lower()
    df_nutri = df_nutri.drop_duplicates(subset=['ingr_name'])
    
    # تحويل البيانات لقاموس لزيادة سرعة البحث
    nutri_dict = df_nutri.set_index('ingr_name').to_dict('index')
    print(f"✅ تم تحميل الموديل وقاعدة البيانات بنجاح ({len(nutri_dict)} مكون)")
except Exception as e:
    print(f"❌ خطأ في التحميل: {e}")
    nutri_dict = {}

# --- التعديل الجوهري هنا: الـ Mapping الصحيح بناءً على ملفك الـ CSV ---
LABEL_CORRECTION = {
    'strawberry': 'strawberries',    # في ملفك موجودة بالجمع strawberries
    'strawberrys': 'strawberries',
    'ice cream': 'ice cream',        # موجودة في سطر 45
    'biscuit': 'biscuit',            # موجودة في سطر 502
    'cake': 'cake',                  # موجودة في سطر 473
    'cilantro mint': 'chive',        # الأقرب في ملفك هي chive سطر 527
    'red_meat': 'steak',             # سطر 10
    'red_meats': 'steak',
    'chicken duck': 'chicken',       # سطر 14
    'potato': 'potatoes',            # سطر 5
    'potatos': 'potatoes',
    'celery stick': 'celery root',   # سطر 528
    'rice': 'wild rice',             # سطر 9
    'egg': 'scrambled eggs',         # سطر 8
    'cheese butter': 'cottage cheese', # سطر 1
    'french beans': 'green beans',   # سطر 515
    'lettuce': 'garden salad',       # سطر 3
    'lemon': 'lemon',                # سطر 461
    'sauce': 'pesto',                # سطر 532
    'orange': 'orange',              # سطر 468
    'french fries': 'french fries',
    'bread': 'bread'
}

# تحديث الكثافة لكل الأصناف لضمان حساب الوزن بدقة
DENSITY_MAP = {
    'strawberries': 0.06, 'ice cream': 0.08, 'biscuit': 0.07, 'cake': 0.10,
    'chive': 0.02, 'steak': 0.13, 'chicken': 0.12, 'potatoes': 0.09,
    'celery root': 0.04, 'wild rice': 0.11, 'scrambled eggs': 0.09,
    'cottage cheese': 0.08, 'green beans': 0.05, 'garden salad': 0.03,
    'lemon': 0.05, 'pesto': 0.10, 'orange': 0.07, 'french fries': 0.07,
    'broccoli': 0.04, 'corn': 0.11, 'bread': 0.03, 'fish': 0.10, 'tomato': 0.07
}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image_pil = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # الاستنتاج باستخدام الموديل
        results = model.predict(source=image_pil, conf=0.25, imgsz=640)
        res = results[0]
        
        # تحضير صورة النتائج
        res_plotted = res.plot()
        _, buffer = cv2.imencode('.jpg', res_plotted)
        img_base64 = base64.b64encode(buffer).decode('utf-8')

        detections = []
        totals = {"calories": 0, "fat": 0, "carbs": 0, "protein": 0}
        
        if res.masks is not None:
            for i in range(len(res.boxes)):
                raw_label = model.names[int(res.boxes.cls[i])].lower().strip()
                label = LABEL_CORRECTION.get(raw_label, raw_label)
                conf = float(res.boxes.conf[i])
                
                # البحث في القاموس
                row = nutri_dict.get(label)
                
                # إذا لم يجد تطابقاً كاملاً، نبحث جزئياً داخل القاموس (لحل مشكلة cake و ice cream)
                if not row:
                    for key in nutri_dict.keys():
                        if label in key or key in label:
                            row = nutri_dict[key]
                            label = key
                            break

                if row:
                    # حساب المساحة من الـ Mask
                    area_px = float(torch.sum(res.masks.data[i]).item())
                    factor = DENSITY_MAP.get(label, 0.08)
                    weight_g = (area_px * factor) / 10
                    
                    # حساب القيم الغذائية
                    cals = weight_g * row['cal/g']
                    fats = weight_g * row['fat(g)']
                    carbs = weight_g * row['carb(g)']
                    prots = weight_g * row['protein(g)']
                    
                    totals["calories"] += cals
                    totals["fat"] += fats
                    totals["carbs"] += carbs
                    totals["protein"] += prots

                    detections.append({
                        "item": label.replace("_", " ").capitalize(),
                        "weight": f"{round(weight_g, 1)}g",
                        "confidence": f"{round(conf * 100, 0)}%",
                        "nutrients": {
                            "calories": round(cals, 1),
                            "protein": round(prots, 1),
                            "carbs": round(carbs, 1),
                            "fat": round(fats, 1)
                        }
                    })
                else:
                    # في حال لم يجد الصنف في الـ CSV
                    detections.append({
                        "item": label.capitalize() + " (Not in Database)",
                        "weight": "N/A",
                        "confidence": f"{round(conf * 100, 0)}%",
                        "nutrients": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
                    })

        return {
            "status": "success",
            "result_image": f"data:image/jpeg;base64,{img_base64}",
            "summary": {k: round(v, 2) for k, v in totals.items()},
            "details": detections
        }
    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)