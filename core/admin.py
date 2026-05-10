from django.contrib import admin
from django.utils.safestring import mark_safe
from django.urls import reverse, path
from django.shortcuts import redirect, render
from .models import Post, Profile, Message

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'specialty_type', 'is_approved', 'certificate_link')
    list_editable = ['is_approved']
    list_filter = ('role', 'is_approved')
    search_fields = ('user__username', 'user__email', 'specialty_type')

    def certificate_link(self, obj):
        if obj.work_certificate:
            return mark_safe(f'<a href="{obj.work_certificate.url}" target="_blank" style="color: #194459; font-weight: bold;">View Cert 📄</a>')
        return "No File"
    certificate_link.short_description = "Work Certificate"

from django.contrib import admin
from .models import Appointment  # تأكد بلي راك مستورد الموديل

admin.site.register(Appointment)
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('author', 'content_preview', 'is_validated', 'image_preview', 'reject_button', 'created_at')
    list_editable = ('is_validated',) # Approved/Pending toggle with one click
    list_filter = ('is_validated', 'created_at')
    search_fields = ('content', 'author__username', 'author__email')
    readonly_fields = ('image_preview',)
    actions = ['reject_posts']

    def reject_button(self, obj):
        url = reverse('admin:core_post_delete', args=[obj.id])
        return mark_safe(f'<a href="{url}" style="color: #ef4444; font-weight: bold; text-decoration: none; border: 1px solid #ef4444; padding: 2px 8px; border-radius: 4px;">Reject ❌</a>')
    reject_button.short_description = "Quick Reject"

    @admin.action(description="❌ Reject selected posts (Delete permanently)")
    def reject_posts(self, request, queryset):
        count = queryset.count()
        queryset.delete() # Permanent removal logic
        self.message_user(request, f"Successfully rejected (deleted) {count} posts.")
        print(f"ADMIN ACTION-REJECT: {request.user} permanently deleted {count} posts.")

    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = "Content"

    def image_preview(self, obj):
        if obj.image:
            # Thumbnail size 50x50
            return mark_safe(f'<img src="{obj.image.url}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />')
        return "No Image"
    image_preview.short_description = "Photo Preview"

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat_type', 'direction_indicator', 'sender', 'receiver', 'content_preview', 'is_read', 'reply_button', 'timestamp')
    list_filter = ('chat_type', 'is_read', 'timestamp', 'sender__is_superuser')
    list_editable = ('is_read',)
    search_fields = ('content', 'sender__username', 'receiver__username')
    readonly_fields = ('timestamp', 'reply_button')
    ordering = ('-timestamp',)

    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = "Message Content"

    def direction_indicator(self, obj):
        if obj.sender.is_superuser:
            return mark_safe('<span style="color: #0ea5e9; font-weight: bold;">⬅️ Admin Reply</span>')
        return mark_safe('<span style="color: #85B599; font-weight: bold;">➡️ Patient Query</span>')
    direction_indicator.short_description = "Flow"

    def reply_button(self, obj):
        if obj.sender.is_superuser:
            return "Response Sent"
        url = reverse('admin:message-reply', args=[obj.id])
        return mark_safe(f'<a href="{url}" style="background: #194459; color: white; padding: 5px 12px; border-radius: 4px; text-decoration: none; font-weight: bold;">Reply 💬</a>')
    reply_button.short_description = "Action"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<int:message_id>/reply/', self.admin_site.admin_view(self.reply_view), name='message-reply'),
        ]
        return custom_urls + urls

    def reply_view(self, request, message_id):
        original_msg = Message.objects.get(pk=message_id)
        if request.method == 'POST':
            content = request.POST.get('content')
            if content:
                Message.objects.create(
                    sender=request.user,
                    receiver=original_msg.sender,
                    content=content,
                    chat_type=original_msg.chat_type # Maintain the original context type
                )
                self.message_user(request, f"Reply sent to {original_msg.sender.username}")
                return redirect('admin:core_message_changelist')
        
        context = {
            **self.admin_site.each_context(request),
            'original_msg': original_msg,
            'title': f'Reply to {original_msg.sender.username}',
            'opts': self.model._meta,
        }
        # Render a simple standalone HTML for the reply form
        from django.http import HttpResponse
        html = f"""
        <html>
        <head><title>Reply - Hygeia</title><style>
            body {{ font-family: 'Inter', sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }}
            .card {{ background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 600px; width: 100%; border: 1px solid #e2e8f0; }}
            h2 {{ color: #194459; margin-top: 0; font-size: 1.8rem; margin-bottom: 20px; }}
            .quote {{ background: #f1f5f9; padding: 20px; border-left: 5px solid #194459; margin-bottom: 30px; font-style: italic; border-radius: 0 8px 8px 0; }}
            textarea {{ width: 100%; height: 180px; padding: 15px; border: 2px solid #cbd5e1; border-radius: 12px; margin-bottom: 25px; font-size: 16px; outline: none; transition: border-color 0.2s; }}
            textarea:focus {{ border-color: #194459; }}
            button {{ background: #194459; color: white; border: none; padding: 14px 30px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 16px; transition: transform 0.2s; }}
            button:hover {{ transform: scale(1.02); }}
        </style></head>
        <body>
            <div class="card">
                <h2>Replying to {original_msg.sender.username}</h2>
                <div class="quote">"{original_msg.content}"</div>
                <form method="post">
                    <input type="hidden" name="csrfmiddlewaretoken" value="{request.COOKIES.get('csrftoken', '')}">
                    <textarea name="content" placeholder="Type your professional response here..." required></textarea>
                    <br>
                    <button type="submit">Submit Reply</button>
                    <a href="javascript:history.back()" style="margin-left: 20px; color: #64748b; text-decoration: none; font-weight: 500;">Cancel</a>
                </form>
            </div>
        </body>
        </html>
        """
        return HttpResponse(html)
