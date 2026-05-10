from django.urls import path, include
from .views import (
    RegisterView, LoginView, 
    AdminPendingPostsView, AdminValidatePostView, AdminDeletePostView,
    AdminUserListView, AdminUserDeleteView,
    PendingNutritionistsView, ApproveUserView, SpecialistListView, SpecialistDetailView, CreateAppointmentView, ManageAvailabilityView,
    CurrentUserInfoView, UserAppointmentListView,
    MessageViewSet, MessageAdminListView, MarkMessagesReadView, SupportInboxView,
    NutritionistPatientsView, SendPlanToPatientView, PostViewSet, DailyProgressViewSet,
    CompleteAppointmentView, NotificationListView, MarkNotificationsReadView
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'daily-progress', DailyProgressViewSet, basename='daily-progress')

urlpatterns = [
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/user/', CurrentUserInfoView.as_view(), name='current-user'),
    
    # Public/Authenticated Endpoints
    path('user/appointments/', UserAppointmentListView.as_view(), name='user-appointments'),
    path('', include(router.urls)),
    path('specialists/', SpecialistListView.as_view(), name='specialists'),
    path('specialists/<int:pk>/', SpecialistDetailView.as_view(), name='specialist-detail'),
    path('specialist/availability/', ManageAvailabilityView.as_view(), name='specialist-availability'),
    path('appointments/', CreateAppointmentView.as_view(), name='create-appointment'),
    path('appointments/<int:pk>/complete/', CompleteAppointmentView.as_view(), name='complete-appointment'),
    path('nutritionist/patients/', NutritionistPatientsView.as_view(), name='nutritionist-patients'),
    path('nutritionist/send-plan/', SendPlanToPatientView.as_view(), name='nutritionist-send-plan'),
    
    # Admin Endpoints
    path('admin/pending-posts/', AdminPendingPostsView.as_view(), name='admin-pending-posts'),
    path('admin/validate-post/<int:pk>/', AdminValidatePostView.as_view(), name='admin-validate-post'),
    path('admin/delete-post/<int:pk>/', AdminDeletePostView.as_view(), name='admin-delete-post'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/delete/', AdminUserDeleteView.as_view(), name='admin-user-delete'),
    path('admin/pending-nutritionists/', PendingNutritionistsView.as_view(), name='admin-pending-nutritionists'),
    path('admin/approve-nutritionist/<int:pk>/', ApproveUserView.as_view(), name='admin-approve-nutritionist'),
    
    # Message Endpoints
    path('messages/', MessageViewSet.as_view(), name='messages'),
    path('messages/admin-list/', MessageAdminListView.as_view(), name='admin-message-list'),
    path('messages/mark-read/<int:partner_id>/', MarkMessagesReadView.as_view(), name='mark-read'),
    path('admin/support-inbox/', SupportInboxView.as_view(), name='admin-support-inbox'),
    
    # Notification Endpoints
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/mark-read/', MarkNotificationsReadView.as_view(), name='mark-notifications-read'),
]
