import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Camera, Brain, PieChart, UploadCloud, Settings, CheckCircle, FileText, CreditCard, ArrowRight, Lock, X, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AITracker() {
  const [scanState, setScanState] = useState('upload'); // 'upload', 'scanning', 'result'
  const [previewImage, setPreviewImage] = useState(null);
  const [mealResults, setMealResults] = useState(null); 
  const [scansRemaining, setScansRemaining] = useState(0); 
  
  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentData, setPaymentData] = useState({ cardNum: '', expiry: '', cvv: '', name: '' });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const userType = localStorage.getItem('user_type');

  useEffect(() => {
    if (userType === 'NUTRITIONIST') {
      navigate('/dashboard/nutritionist');
    }
  }, [userType, navigate]);

  // Handle triggering the file selection
  const triggerFileInput = () => {
    if (scansRemaining === 0) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      const fallback = document.getElementById('fileInput');
      if (fallback) fallback.click();
    }
  };

  // Process Simulated Payment
  const handlePayment = (e) => {
    e.preventDefault();
    setIsPaying(true);
    setTimeout(() => {
      setScansRemaining(prev => prev + 3);
      setIsPaying(false);
      setShowPaymentModal(false);
      setPaymentData({ cardNum: '', expiry: '', cvv: '', name: '' });
      alert("Payment Successful! 3 Scan credits added.");
    }, 2000);
  };

  // دالة تصدير ملف PDF المحدثة
  const exportToPDF = () => {
    try {
      if (!mealResults) return;

      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // 1. Header
      doc.setFontSize(22);
      doc.setTextColor(25, 68, 89);
      doc.text("AI Nutrition Analysis Report", 105, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${timestamp}`, 105, 28, { align: "center" });

      // 2. Image Section (Prominent)
      let currentY = 35;
      if (mealResults.processedImage) {
        doc.addImage(mealResults.processedImage, 'JPEG', 25, currentY, 160, 85);
        currentY += 95;
      }

      // Calculation of totals
      const details = mealResults.details || [];
      const totalCalories = details.reduce((sum, item) => sum + parseFloat(item.nutrients?.calories || 0), 0);
      const totalProtein = details.reduce((sum, item) => sum + parseFloat(item.nutrients?.protein || 0), 0);
      const totalCarbs = details.reduce((sum, item) => sum + parseFloat(item.nutrients?.carbs || 0), 0);
      const totalFats = details.reduce((sum, item) => sum + parseFloat(item.nutrients?.fat || 0), 0);

      // 3. Totals Summary Table
      autoTable(doc, {
        startY: currentY,
        head: [['Nutrient', 'Total Value']],
        body: [
          ['Total Calories', `${totalCalories.toFixed(2)} kcal`],
          ['Total Protein', `${totalProtein.toFixed(2)}g`],
          ['Total Carbohydrates', `${totalCarbs.toFixed(2)}g`],
          ['Total Fats', `${totalFats.toFixed(2)}g`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [133, 181, 153] },
        styles: { halign: 'center' },
      });

      // 4. Detailed Ingredients Table
      const nextY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text("Detailed Ingredients Breakdown", 20, nextY);

      const detailsData = details.map(item => [
        item.item || 'Unknown',
        item.weight || '0g',
        `${Math.round(parseFloat(item.confidence || 0) )}%`,
        `${parseFloat(item.nutrients?.calories || 0).toFixed(2)} kcal`
      ]);

      autoTable(doc, {
        startY: nextY + 5,
        head: [['Ingredient', 'Weight', 'Confidence', 'Calories']],
        body: detailsData,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [25, 68, 89] },
      });

      // 5. Footer
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text("Verified by AI Vision Engine • Premium Analysis", 105, 285, { align: "center" });

      doc.save(`AI_Nutrition_Report_${(mealResults.label || 'Meal').replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to generate PDF report.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && scansRemaining > 0) {
        setPreviewImage(URL.createObjectURL(file));
        setScanState('scanning');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://127.0.0.1:8001/predict', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("AI Server Error");

            const data = await response.json();

            // Set results and deduct credit simultaneously
            setMealResults({
                calories: data.summary.calories || 0,
                protein: data.summary.protein || 0,
                carbs: data.summary.carbs || 0,
                fats: data.summary.fat || 0,
                label: data.details.length > 0 ? data.details[0].item : 'Unknown Meal',
                processedImage: data.result_image,
                details: data.details
            });

            setScansRemaining(prev => prev - 1);
            setScanState('result');
        } catch (error) {
            console.error("Tracker Error:", error);
            alert("Failed to connect to the AI model.");
            setScanState('upload');
        }
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <section className="section" style={{ paddingTop: '110px', minHeight: '100vh', background: '#f8fafc' }}>
          <div className="tracker-container animate-fade" style={{ maxWidth: '1100px', margin: '0 auto', width: '95%' }}>

            {/* Header */}
            <div className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <h1 style={{ fontSize: '3.2rem', fontWeight: 'bold', margin: 0, color: '#194459' }}>AI Nutrition Tracker</h1>
                <span style={{ background: '#C4E892', color: '#194459', padding: '6px 18px', borderRadius: '25px', fontWeight: 'bold', fontSize: '0.85rem' }}>PREMIUM</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '1.2rem' }}>State-of-the-art vision analysis for your health.</p>
            </div>

            {/* How it Works - Top Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '4rem' }}>
              {[
                { step: '01', title: 'Pay for Credits', desc: 'Secure 3-scan credit pack.', icon: <CreditCard size={24} /> },
                { step: '02', title: 'Upload Photo', desc: 'Analyzes your plate instantly.', icon: <Camera size={24} /> },
                { step: '03', title: 'Get Breakdown', desc: 'Macros & PDF report ready.', icon: <Brain size={24} /> }
              ].map((item, idx) => (
                <div key={idx} style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '55px', height: '55px', background: 'rgba(25, 68, 89, 0.05)', color: '#194459', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                    {item.icon}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', color: '#194459', marginBottom: '8px', fontWeight: 'bold' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Main Tracker Container */}
            <div className="tracker-box" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '35px', padding: '4rem', minHeight: '550px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.06)' }}>
              
              {/* Credits HUD */}
              <div style={{ position: 'absolute', top: '35px', right: '35px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#194459', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={20} color="#85B599" /> Credits: {scansRemaining}
                </div>
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  style={{ background: '#C4E892', color: '#194459', border: 'none', padding: '10px 20px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <CreditCard size={18} /> Buy 3 Scans for $4
                </button>
              </div>

              {scanState === 'upload' && (
                <div style={{ textAlign: 'center', width: '100%', maxWidth: '550px', margin: 'auto' }}>
                  <div style={{ marginBottom: '45px' }}>
                    <div style={{ width: '90px', height: '90px', background: 'rgba(133, 181, 153, 0.1)', color: '#85B599', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                      {scansRemaining === 0 ? <Lock size={45} /> : <UploadCloud size={45} />}
                    </div>
                    <h2 style={{ fontSize: '2.2rem', color: '#194459', fontWeight: 'bold', marginBottom: '15px' }}>AI Visual Analysis</h2>
                    {scansRemaining === 0 ? (
                      <p style={{ color: '#ef4444', fontWeight: 'bold' }}>Purchase credits to unlock AI macro calculation.</p>
                    ) : (
                      <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Upload a photo of your meal to begin identifying macros.</p>
                    )}
                  </div>

                  <button 
                    disabled={scansRemaining === 0}
                    onClick={triggerFileInput} 
                    style={{ 
                      background: scansRemaining === 0 ? '#cbd5e1' : '#194459', 
                      color: 'white', padding: '1.5rem 5rem', borderRadius: '60px', 
                      fontWeight: 'bold', fontSize: '1.4rem', border: 'none', 
                      cursor: scansRemaining === 0 ? 'not-allowed' : 'pointer', 
                      display: 'inline-flex', alignItems: 'center', gap: '15px' 
                    }}
                  >
                    {scansRemaining === 0 ? <Lock size={28} /> : <Camera size={28} />} Upload Plate
                  </button>
                  <input type="file" id="fileInput" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                </div>
              )}

              {scanState === 'scanning' && (
                <div style={{ textAlign: 'center', width: '100%', margin: 'auto' }}>
                  <div style={{ position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
                    <img src={previewImage} alt="Scanning" style={{ width: '100%', borderRadius: '30px', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }} />
                    <div className="laser" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: '#C4E892', boxShadow: '0 0 25px #C4E892', animation: 'scan 2.5s infinite ease-in-out' }}></div>
                  </div>
                  <div style={{ marginTop: '45px', color: '#194459', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontWeight: 'bold', fontSize: '1.4rem' }}>
                    <Settings className="spin" size={32} /> AI Vision Engine is processing plate segments...
                  </div>
                </div>
              )}

              {scanState === 'result' && mealResults && (
                <div style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
                      <CheckCircle color="#85B599" size={36} />
                      <span style={{ color: '#85B599', fontWeight: 'bold', fontSize: '1.3rem' }}>SCAN SUCCESSFUL</span>
                    </div>
                    <h3 style={{ fontSize: '3rem', color: '#194459', fontWeight: 'bold' }}>{mealResults.label}</h3>
                  </div>

                  {/* Main Two-Column Layout */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '60px', alignItems: 'start', marginBottom: '5rem' }}>
                    {/* Left: Prominent Analyzed Image */}
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={mealResults.processedImage} 
                        alt="AI Analysis" 
                        style={{ width: '100%', borderRadius: '30px', border: '8px solid #f8fafc', boxShadow: '0 30px 70px rgba(0,0,0,0.1)' }} 
                      />
                      <div style={{ position: 'absolute', top: '25px', left: '25px', background: '#C4E892', color: '#194459', padding: '8px 16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                        AI Vision Masks: ON
                      </div>
                    </div>

                    {/* Right: Macro Sidebar + Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {[
                          { l: 'Calories', v: mealResults.calories, u: 'kcal', color: '#194459' },
                          { l: 'Protein', v: mealResults.protein, u: 'g', color: '#85B599' },
                          { l: 'Carbs', v: mealResults.carbs, u: 'g', color: '#194459' },
                          { l: 'Fats', v: mealResults.fats, u: 'g', color: '#85B599' }
                        ].map((m, i) => (
                          <div key={i} style={{ padding: '25px', background: '#f8fafc', borderRadius: '25px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: '1rem', marginBottom: '8px', fontWeight: '500' }}>{m.l}</div>
                            <strong style={{ fontSize: '2rem', color: m.color }}>{m.v}<span style={{fontSize: '1.1rem', marginLeft: '3px'}}>{m.u}</span></strong>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button onClick={exportToPDF} style={{ width: '100%', padding: '20px', background: '#85B599', color: 'white', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(133, 181, 153, 0.3)' }}>
                          <FileText size={24} /> Download PDF Report
                        </button>
                        <button onClick={() => setScanState('upload')} style={{ width: '100%', padding: '20px', background: '#194459', color: 'white', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '1.1rem' }}>
                          Scan New Meal <ArrowRight size={24} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Ingredients Table (Full Width) */}
                  <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '4rem' }}>
                    <h4 style={{ color: '#194459', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <PieChart size={28} color="#85B599" /> Detailed Ingredients Analysis
                    </h4>
                    <div style={{ overflow: 'hidden', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc' }}>
                          <tr>
                            {['Ingredient Name', 'Weight', 'Confidence', 'Calories'].map((h, i) => (
                              <th key={i} style={{ padding: '20px', color: '#194459', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(mealResults.details || []).map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '20px', fontWeight: '600', color: '#194459' }}>{item.item}</td>
                              <td style={{ padding: '20px', color: '#64748b' }}>{item.weight}</td>
                              <td style={{ padding: '20px', color: '#85B599', fontWeight: 'bold' }}>{Math.round(parseFloat(item.confidence || 0) * 100)}%</td>
                              <td style={{ padding: '20px', color: '#194459', fontWeight: 'bold' }}>{parseFloat(item.nutrients?.calories || 0).toFixed(2)} kcal</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
            <div style={{ background: 'white', width: '95%', maxWidth: '460px', borderRadius: '35px', padding: '40px', position: 'relative', animation: 'modalSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <button onClick={() => setShowPaymentModal(false)} style={{ position: 'absolute', top: '25px', right: '25px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
              
              <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                <div style={{ width: '75px', height: '75px', background: '#f1f5f9', color: '#194459', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CreditCard size={35} />
                </div>
                <h2 style={{ fontSize: '2rem', color: '#194459', fontWeight: 'bold' }}>Purchase Scan Credits</h2>
                <p style={{ color: '#64748b', marginTop: '8px' }}>Unlock 3 premium AI nutrition scans for only $4.00</p>
              </div>

              <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {['Cardholder Name', 'Card Number'].map((l, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#194459' }}>{l}</label>
                    <input type="text" required placeholder={i === 0 ? "John Doe" : "**** **** **** ****"} onChange={e => setPaymentData({...paymentData, [i === 0 ? 'name' : 'cardNum']: e.target.value})} style={{ padding: '16px', borderRadius: '15px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {['Expiry Date', 'CVV'].map((l, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#194459' }}>{l}</label>
                      <input type="text" required placeholder={i === 0 ? "MM/YY" : "***"} onChange={e => setPaymentData({...paymentData, [i === 0 ? 'expiry' : 'cvv']: e.target.value})} style={{ padding: '16px', borderRadius: '15px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={isPaying} style={{ background: '#194459', color: 'white', padding: '20px', borderRadius: '18px', border: 'none', fontWeight: 'bold', fontSize: '1.2rem', cursor: isPaying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '10px', boxShadow: '0 15px 30px rgba(25, 68, 89, 0.2)' }}>
                  {isPaying ? <Settings className="spin" size={24} /> : <Lock size={24} />}
                  {isPaying ? 'Processing...' : 'Secure Checkout'}
                </button>
              </form>
              
              <div style={{ textAlign: 'center', marginTop: '25px', color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> Encrypted & Secure Connection
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
        .spin { animation: rotate 2s linear infinite; }
        @keyframes rotate { 100% { transform: rotate(360deg); } }
        .animate-fade { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalSlide { from { opacity: 0; transform: scale(0.95) translateY(40px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </>
  );
}