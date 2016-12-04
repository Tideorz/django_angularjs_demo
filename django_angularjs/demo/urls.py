from demo.api.registry import api
from django.conf.urls import patterns, url, include
from demo.views import homepage

urlpatterns = patterns('', 
    url(r'^api/', include(api.urls)),
    url(r'^$', homepage, name='homepage'),
)
