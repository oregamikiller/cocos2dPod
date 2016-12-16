cloned = Marshal.load(Marshal.dump(Pod::Sandbox::FileAccessor::GLOB_PATTERNS))
Pod::Sandbox::FileAccessor::HEADER_EXTENSIONS = (%w(.inl .msg) + Pod::Sandbox::FileAccessor::HEADER_EXTENSIONS)
puts Pod::Sandbox::FileAccessor::HEADER_EXTENSIONS
s = Pod::Sandbox::FileAccessor::GLOB_PATTERNS[:public_header_files]
s = s[0...s.length-1]+',.inl,.msg'+s[s.length-1]
cloned[:public_header_files] = s
puts Pod::Sandbox::FileAccessor::GLOB_PATTERNS = cloned

Pod::Spec.new do |s|
s.name             = 'Cocos2dPod'
s.version          = '1.0.0'
s.summary          = 'Cocos2dPod for pod install'

s.description      = <<-DESC
Cocos动画引擎SDK.
                   DESC

s.homepage         = 'https://wiki.bytedance.com'
s.license          = { :type => 'MIT', :file => 'LICENSE' }
s.author           = { 'oregami' => 'oregami@163.com' }
s.source           = { :git => "git@github.com:oregamikiller/cocos2dPod.git", :tag => "1.0.0" }
s.ios.deployment_target = '8.0'
s.header_dir = 'cocos/, extensions/,external/'
s.header_mappings_dir = 'cocos/, extensions/,external/'
s.source_files = 'external/spidermonkey/include/ios/**/*.{h,inl,msg}', 'extensions/**/*.{h,inl}', 'cocos/**/*.{h,inl,hpp}'
s.resource = 'Resources/Cocos2dPod.bundle'
s.xcconfig     = { 'HEADER_SEARCH_PATHS' => '"${PODS_ROOT}/Headers/Public/Cocos2dPod/cocos" "${PODS_ROOT}/Headers/Public/Cocos2dPod/external/spidermonkey/include/ios" "$(PODS_ROOT)/Headers/Public/Cocos2dPod/cocos/editor-support/"' }
s.resources = ['main.js','scence0.js', 'project.json','res','script','src']
s.libraries = 'stdc++', 'sqlite3', 'iconv','z'
s.frameworks = 'OpenAL', 'CoreMotion', 'QuartzCore', 'GameController', 'AVFoundation', 'AudioToolbox', 'MediaPlayer'
s.vendored_library = '*.{a}'

end
