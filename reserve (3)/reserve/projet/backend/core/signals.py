from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile, Appointment, DailyProgress
from datetime import timedelta
from django.utils import timezone

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    # FIX: Use get_or_create to avoid 'Already Exists' errors during saves/manual updates
    Profile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    # Ensure profile exists before saving
    if hasattr(instance, 'profile'):
        instance.profile.save()
    else:
        Profile.objects.get_or_create(user=instance)

@receiver(post_save, sender=Appointment)
def create_daily_progress_for_appointment(sender, instance, created, **kwargs):
    # Only generate if the appointment is created and confirmed/upcoming
    if created and instance.status in ['UPCOMING', 'COMPLETED']:
        plan = instance.plan_name
        days = 0
        if 'Quick Start' in plan:
            days = 15
        elif '1-Month' in plan:
            days = 30
        elif 'Golden Plan' in plan:
            days = 90
            
        if days > 0:
            # Check if user already has an active plan
            existing_progress = DailyProgress.objects.filter(user=instance.patient).exists()
            if not existing_progress:
                start_date = timezone.now().date()
                progress_entries = []
                for i in range(1, days + 1):
                    progress_entries.append(
                        DailyProgress(
                            user=instance.patient,
                            date=start_date + timedelta(days=i - 1),
                            day_number=i,
                        )
                    )
                DailyProgress.objects.bulk_create(progress_entries)
