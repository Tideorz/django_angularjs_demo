from tastypie.api import Api 
from demo.api.resource import *

api = Api(api_name='v1')
api.register(UserProfileResource())
