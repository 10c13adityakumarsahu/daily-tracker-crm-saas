from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'instructors', InstructorViewSet, basename='instructor')
router.register(r'timetable', TimetableViewSet, basename='timetable')
router.register(r'sessions', ClassSessionViewSet, basename='classsession')
router.register(r'homework', HomeworkViewSet, basename='homework')
router.register(r'materials', MaterialViewSet, basename='material')
router.register(r'classrooms', ClassroomViewSet, basename='classroom')
router.register(r'subjects', SubjectViewSet, basename='subject')

urlpatterns = [
    path('api/signup/organizer/', organizer_signup, name='organizer_signup'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
]
