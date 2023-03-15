#!/bin/sh

gn gen out.gn/trivialize --args='is_debug=false dcheck_always_on=true v8_static_library=true v8_enable_verify_heap=true v8_fuzzilli=true'
ninja -C out.gn/trivialize
