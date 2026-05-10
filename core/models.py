from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = (
        ('PATIENT', 'Patient'),
        ('NUTRITIONIST', 'Nutritionist'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    TIER_CHOICES = (
        ('basic', 'Basic'),
        ('standard', 'Standard'),
        ('premium', 'Premium'),
    )
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='basic', db_index=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='PATIENT', db_index=True)
    specialty_type = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    rating = models.FloatField(default=5.0)
    num_reviews = models.IntegerField(default=0)
    work_certificate = models.FileField(upload_to='certificates/', null=True, blank=True)
    is_approved = models.BooleanField(default=False, db_index=True)
    GOAL_CHOICES = [
        ('WEIGHT_LOSS', 'Weight Loss'),
        ('MUSCLE_GAIN', 'Muscle Gain'),
        ('MANAGE_ILLNESS', 'Manage Illness'),
        ('GENERAL_HEALTH', 'General Health'),
    ]
    LIFESTYLE_CHOICES = [
        ('SEDENTARY', 'Sedentary'),
        ('LIGHTLY_ACTIVE', 'Lightly Active'),
        ('VERY_ACTIVE', 'Very Active'),
    ]
    
    phone = models.CharField(max_length=20, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    meeting_url = models.URLField(max_length=500, blank=True, null=True)

    # Health Information
    health_issues = models.TextField(blank=True, null=True)
    primary_goal = models.CharField(max_length=50, choices=GOAL_CHOICES, blank=True, null=True)
    allergies_meds = models.TextField(blank=True, null=True)
    lifestyle = models.CharField(max_length=50, choices=LIFESTYLE_CHOICES, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    image = models.ImageField(upload_to='publications/', null=True, blank=True)
    is_validated = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        status = "Validated" if self.is_validated else "Pending"
        return f"{status} Post by {self.author.username} at {self.created_at}"

class Appointment(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments_as_patient')
    specialist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments_as_specialist')
    STATUS_CHOICES = [
        ('UPCOMING', 'Upcoming'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    plan_name = models.CharField(max_length=50)
    date = models.CharField(max_length=50) # e.g. "Thu 16.04"
    time = models.CharField(max_length=50) # e.g. "14:00"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='UPCOMING', db_index=True)
    zoom_link = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('specialist', 'date', 'time')

    def __str__(self):
        return f"{self.patient.username} - {self.specialist.username} ({self.date} {self.time})"

    def save(self, *args, **kwargs):
        # 1. Try to inherit the specific meeting link from the nutritionist's profile
        if not self.zoom_link:
            try:
                prof = self.specialist.profile
                if prof.meeting_url:
                    self.zoom_link = prof.meeting_url
            except:
                pass
        
        # 2. Perform the initial save to ensure we have a primary key (ID)
        super().save(*args, **kwargs)
        
        # 3. Marketplace Fallback: If no link was inherited, generate a default one based on the ID
        if not self.zoom_link:
            fallback_link = f"https://zoom.us/j/{self.id}"
            # Use .update() to bypass signals/recursion and save only the link
            Appointment.objects.filter(pk=self.pk).update(zoom_link=fallback_link)
            self.zoom_link = fallback_link

class Availability(models.Model):
    specialist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.CharField(max_length=20) # e.g. "Monday", "Tuesday"
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    is_active = models.BooleanField(default=False)

    class Meta:
        unique_together = ('specialist', 'day_of_week')

    def __str__(self):
        return f"{self.specialist.username} - {self.day_of_week} ({self.is_active})"

class Message(models.Model):
    CHAT_TYPE_CHOICES = [
        ('SUPPORT', 'Support'),
        ('CONSULTATION', 'Consultation'),
    ]
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    chat_type = models.CharField(max_length=20, choices=CHAT_TYPE_CHOICES, default='SUPPORT')
    content = models.TextField(blank=True) # allow blank text if they just upload a file
    attachment = models.FileField(upload_to='messages/attachments/', null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"From {self.sender.username} to {self.receiver.username} at {self.timestamp}"

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on {self.post}"

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f"Like by {self.user.username} on {self.post}"
class PatientQuestionnaire(models.Model):
    GOAL_CHOICES = [
        ('WEIGHT_LOSS', 'Weight Loss'),
        ('MUSCLE_GAIN', 'Muscle Gain'),
        ('MANAGE_ILLNESS', 'Manage Illness'),
        ('GENERAL_HEALTH', 'General Health'),
    ]
    LIFESTYLE_CHOICES = [
        ('SEDENTARY', 'Sedentary'),
        ('LIGHTLY_ACTIVE', 'Lightly Active'),
        ('VERY_ACTIVE', 'Very Active'),
    ]
    
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='questionnaire')
    health_issues = models.TextField()
    primary_goal = models.CharField(max_length=50, choices=GOAL_CHOICES)
    allergies_meds = models.TextField()
    lifestyle = models.CharField(max_length=50, choices=LIFESTYLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Questionnaire for Appointment {self.appointment.id}"

class DailyProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress_agenda')
    date = models.DateField()
    day_number = models.IntegerField()
    water_intake = models.BooleanField(default=False)
    exercise = models.BooleanField(default=False)
    followed_diet = models.BooleanField(default=False)
    meal_photo = models.ImageField(upload_to='meals/', null=True, blank=True)
    adherence_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['day_number']
        unique_together = ('user', 'day_number')

    def __str__(self):
        return f"{self.user.username} - Day {self.day_number}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    text = models.CharField(max_length=255)
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.text[:20]}"
