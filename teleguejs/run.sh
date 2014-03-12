#!/bin/sh
export NODE_PATH=/usr/lib/node_modules

# starting gstreamer video server (gstd style)
gst-client create "v4l2src always-copy=false chain-ipipe=true ! capsfilter caps=video/x-raw-yuv,format=(fourcc)NV12,width=640,height=480,framerate=(fraction)30/1 ! queue ! dmaiaccel ! dmaienc_h264 ddrbuf=true encodingpreset=2 ratecontrol=2 intraframeinterval=5 idrinterval=50 targetbitrate=800000 ! rtph264pay ! udpsink port=3000 host=127.0.0.1 enable-last-buffer=false sync=false"

node ./index.js


