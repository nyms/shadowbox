def target_dir
  ENV['TARGET'] || 'build'
end

task :default => :build

desc 'Create a custom build (in $TARGET, defaults to "build")'
task :build do
  require File.expand_path('../tools/shadowbox', __FILE__)

  mkdir_p(target_dir)
  target = Shadowbox::Target.new(target_dir)

  # To disable compression, flash, or video support, use COMPRESS=0 or similar.
  compress = ENV['COMPRESS'] != '0'
  support_flash = ENV['FLASH'] != '0'
  support_video = ENV['VIDEO'] != '0'

  builder = Shadowbox::Builder.new(compress, support_flash, support_video)
  builder.run!(target)
end

desc 'Clean up all temporary files'
task :clean do
  rm_rf(target_dir) if File.exist?(target_dir)
end

desc 'Serve examples over HTTP (on $PORT, defaults to 9292)'
task :serve do
  require 'rack'

  root = File.expand_path('..', __FILE__)
  port = ENV['PORT'] || 9292
  Rack::Handler::WEBrick.run(Rack::File.new(root), :Port => port)
end
