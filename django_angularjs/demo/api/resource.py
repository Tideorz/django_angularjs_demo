from tastypie.resources import ModelResource
from demo.models import UserProfile

class UserProfileResource(ModelResource):
    class Meta:
        queryset = UserProfile.objects.all()
        #resource_name = 'userprofile'


