from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Profile, Appointment, Availability, Comment, Like, PatientQuestionnaire

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ('id', 'day_of_week', 'start_time', 'end_time', 'is_active')

class PatientQuestionnaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientQuestionnaire
        fields = ('id', 'health_issues', 'primary_goal', 'allergies_meds', 'lifestyle', 'created_at')

class AppointmentSerializer(serializers.ModelSerializer):
    specialist_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='specialist', write_only=True)

    class Meta:
        model = Appointment
        fields = ('id', 'patient', 'specialist_id', 'plan_name', 'date', 'time', 'zoom_link', 'created_at')
        read_only_fields = ('patient', 'zoom_link')

    def create(self, validated_data):
        appointment = Appointment.objects.create(**validated_data)
        return appointment

class ProfileSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ('role', 'specialty_type', 'bio', 'image', 'is_approved', 'tier', 'meeting_url', 'health_issues', 'primary_goal', 'allergies_meds', 'lifestyle')

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f"http://127.0.0.1:8000{obj.image.url}"
        return None

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    role = serializers.CharField(source='profile.role', read_only=True)
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'username', 'is_staff', 'is_superuser', 'profile', 'role')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False)
    specialty_type = serializers.CharField(write_only=True, required=False, allow_blank=True)
    bio = serializers.CharField(write_only=True, required=False, allow_blank=True)
    work_certificate = serializers.FileField(write_only=True, required=False, allow_null=True)
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    tier = serializers.CharField(write_only=True, required=False)
    age = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    weight = serializers.FloatField(write_only=True, required=False, allow_null=True)
    height = serializers.FloatField(write_only=True, required=False, allow_null=True)
    health_issues = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    primary_goal = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    allergies_meds = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    lifestyle = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'first_name', 'last_name', 'email', 'password', 'role', 
            'specialty_type', 'bio', 'work_certificate', 'image', 'tier',
            'age', 'weight', 'height', 'health_issues', 'primary_goal', 'allergies_meds', 'lifestyle'
        )

    def create(self, validated_data):
        role = validated_data.pop('role', 'PATIENT')
        specialty_type = validated_data.pop('specialty_type', '')
        bio = validated_data.pop('bio', '')
        work_certificate = validated_data.pop('work_certificate', None)
        image = validated_data.pop('image', None)
        tier = validated_data.pop('tier', 'basic')
        
        username = validated_data['email']
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        
        # Profile is created via signals, so we just update it
        profile = user.profile
        profile.role = role
        profile.specialty_type = specialty_type
        profile.bio = bio
        if work_certificate:
            profile.work_certificate = work_certificate
        if image:
            profile.image = image
        profile.tier = tier
        
        # New Patient Fields
        if 'age' in validated_data: profile.age = validated_data['age']
        if 'weight' in validated_data: profile.weight = validated_data['weight']
        if 'height' in validated_data: profile.height = validated_data['height']
        if 'health_issues' in validated_data: profile.health_issues = validated_data['health_issues']
        if 'primary_goal' in validated_data: profile.primary_goal = validated_data['primary_goal']
        if 'allergies_meds' in validated_data: profile.allergies_meds = validated_data['allergies_meds']
        if 'lifestyle' in validated_data: profile.lifestyle = validated_data['lifestyle']

        profile.save()
        
        return user

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id', 'post', 'user', 'username', 'full_name', 'text', 'created_at')
        read_only_fields = ('user', 'post')

    def get_full_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        if not name:
            username = obj.user.username
            if "@" in username:
                return username.split("@")[0].capitalize()
            return username
        return name

class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_first_name = serializers.CharField(source='author.first_name', read_only=True)
    author_last_name = serializers.CharField(source='author.last_name', read_only=True)
    author_name = serializers.SerializerMethodField()
    author_profile_image = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            'id', 'author', 'author_username', 'author_first_name', 'author_last_name', 
            'author_name', 'full_name', 'author_profile_image', 'content', 'image', 
            'is_validated', 'created_at', 'likes_count', 'comments', 'is_liked'
        )
        read_only_fields = ('author',)

    def get_author_profile_image(self, obj):
        if hasattr(obj.author, 'profile') and obj.author.profile.image:
             request = self.context.get('request')
             if request:
                 return request.build_absolute_uri(obj.author.profile.image.url)
             return f"http://127.0.0.1:8000{obj.author.profile.image.url}"
        return None

    def get_author_name(self, obj):
        return self.get_full_name(obj)

    def get_full_name(self, obj):
        author = obj.author
        name = f"{author.first_name} {author.last_name}".strip()
        if not name:
            username = author.username
            if "@" in username:
                return username.split("@")[0].capitalize()
            return username
        return name

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

class SpecialistSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    rating = serializers.FloatField(source='profile.rating', read_only=True)
    specialty_type = serializers.CharField(source='profile.specialty_type', read_only=True)
    tier = serializers.CharField(source='profile.tier', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'full_name', 'specialty_type', 'rating', 'image', 'tier')

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def get_image(self, obj):
        if obj.profile.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile.image.url)
            return f"http://127.0.0.1:8000{obj.profile.image.url}"
        return None

class SpecialistDetailSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    rating = serializers.FloatField(source='profile.rating', read_only=True)
    specialty_type = serializers.CharField(source='profile.specialty_type', read_only=True)
    tier = serializers.CharField(source='profile.tier', read_only=True)
    bio = serializers.CharField(source='profile.bio', read_only=True)
    num_reviews = serializers.IntegerField(source='profile.num_reviews', read_only=True)
    full_name = serializers.SerializerMethodField()
    availabilities = AvailabilitySerializer(many=True, read_only=True)
    booked_slots = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'full_name', 'specialty_type', 'rating', 'num_reviews', 'bio', 'image', 'tier', 'availabilities', 'booked_slots')

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def get_image(self, obj):
        if obj.profile.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile.image.url)
            return f"http://127.0.0.1:8000{obj.profile.image.url}"
        return None

    def get_booked_slots(self, obj):
        appointments = Appointment.objects.filter(specialist=obj)
        return [{"date": a.date, "time": a.time} for a in appointments]

class ProfileUpdateSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    age = serializers.IntegerField(required=False, allow_null=True)
    weight = serializers.FloatField(required=False, allow_null=True)
    height = serializers.IntegerField(required=False, allow_null=True)
    bio = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    image = serializers.ImageField(required=False, allow_null=True)
    meeting_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    health_issues = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    primary_goal = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    allergies_meds = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    lifestyle = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Profile
        fields = ('phone', 'age', 'weight', 'height', 'bio', 'image', 'meeting_url', 'health_issues', 'primary_goal', 'allergies_meds', 'lifestyle')

    def to_internal_value(self, data):
        # Convert empty strings to None for numeric fields to support 'clear' action from FormData
        data = data.copy()
        for field in ['age', 'weight', 'height']:
            if field in data and data[field] == '':
                data[field] = None
        return super().to_internal_value(data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            if request:
                ret['image'] = request.build_absolute_uri(instance.image.url)
            else:
                ret['image'] = f"http://127.0.0.1:8000{instance.image.url}"
        return ret

class UserUpdateSerializer(serializers.ModelSerializer):
    profile = ProfileUpdateSerializer()
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'profile')

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        # FIX: Ensure a profile always exists before updating it
        profile, created = Profile.objects.get_or_create(user=instance)
        
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()
        
        for attr, value in profile_data.items():
            if attr == 'image' and not value: # Skip empty image
                continue
            setattr(profile, attr, value)
        profile.save()
        
        return instance

class UserAppointmentHistorySerializer(serializers.ModelSerializer):
    specialist_name = serializers.SerializerMethodField()
    specialist_image = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    patient_image = serializers.SerializerMethodField()
    patient_email = serializers.EmailField(source='patient.email', read_only=True)
    patient_health_issues = serializers.CharField(source='patient.profile.health_issues', read_only=True)
    patient_primary_goal = serializers.CharField(source='patient.profile.primary_goal', read_only=True)
    patient_allergies_meds = serializers.CharField(source='patient.profile.allergies_meds', read_only=True)
    patient_lifestyle = serializers.CharField(source='patient.profile.lifestyle', read_only=True)
    
    class Meta:
        model = Appointment
        fields = ('id', 'patient', 'specialist', 'specialist_name', 'specialist_image', 'patient_name', 'patient_image', 'patient_email', 'plan_name', 'date', 'time', 'status', 'zoom_link', 'patient_health_issues', 'patient_primary_goal', 'patient_allergies_meds', 'patient_lifestyle', 'created_at')

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}".strip() or obj.patient.username

    def get_patient_image(self, obj):
        if hasattr(obj.patient, 'profile') and obj.patient.profile.image:
             request = self.context.get('request')
             if request:
                 return request.build_absolute_uri(obj.patient.profile.image.url)
             return f"http://127.0.0.1:8000{obj.patient.profile.image.url}"
        return None

    def get_specialist_name(self, obj):
        return f"{obj.specialist.first_name} {obj.specialist.last_name}".strip() or obj.specialist.username

    def get_specialist_image(self, obj):
        if hasattr(obj.specialist, 'profile') and obj.specialist.profile.image:
             request = self.context.get('request')
             if request:
                 return request.build_absolute_uri(obj.specialist.profile.image.url)
             return f"http://127.0.0.1:8000{obj.specialist.profile.image.url}"
        return None

from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_image = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()

    is_admin_sent = serializers.SerializerMethodField()
    attachment = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ('id', 'sender', 'receiver', 'chat_type', 'content', 'attachment', 'timestamp', 'is_read', 'sender_name', 'sender_image', 'receiver_name', 'is_admin_sent')
        read_only_fields = ('sender', 'timestamp', 'is_read')
        extra_kwargs = {
            'receiver': {'required': False, 'allow_null': True}
        }

    def get_attachment(self, obj):
        if obj.attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment.url)
            # Fallback: use the network host from settings
            from django.conf import settings
            base = getattr(settings, 'BASE_URL', 'http://192.168.1.103:8000')
            return f"{base}{obj.attachment.url}"
        return None

    def get_is_admin_sent(self, obj):
        return obj.sender.is_superuser

    def get_sender_name(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}".strip() or obj.sender.username

    def get_receiver_name(self, obj):
        return f"{obj.receiver.first_name} {obj.receiver.last_name}".strip() or obj.receiver.username

    def get_sender_image(self, obj):
        if hasattr(obj.sender, 'profile') and obj.sender.profile.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.sender.profile.image.url)
            return f"http://127.0.0.1:8000{obj.sender.profile.image.url}"
        return None

from .models import DailyProgress

class DailyProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyProgress
        fields = ['id', 'user', 'date', 'day_number', 'water_intake', 'exercise', 'followed_diet', 'meal_photo', 'adherence_score', 'created_at']
        read_only_fields = ['user', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.meal_photo:
            request = self.context.get('request')
            if request:
                ret['meal_photo'] = request.build_absolute_uri(instance.meal_photo.url)
            else:
                from django.conf import settings
                base = getattr(settings, 'BASE_URL', 'http://127.0.0.1:8000')
                ret['meal_photo'] = f"{base}{instance.meal_photo.url}"
        return ret

