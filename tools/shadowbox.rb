$LOAD_PATH.unshift(File.expand_path('../yuicompressor-1.2.0/lib', __FILE__))

require 'fileutils'
require 'yuicompressor'

module Shadowbox
  @root_dir = File.expand_path('../..', __FILE__)
  @source_dir = File.join(@root_dir, 'source')

  # Get the current version of the code from the source.
  @version = File.open(File.join(@source_dir, 'shadowbox.js'), 'r') do |f|
    match = f.read.match(/shadowbox\.version = (['"])([\w.]+)\1/)
    match or raise "Unable to get current Shadowbox version from source"
    match[2]
  end

  class << self
    attr_reader :root_dir, :source_dir, :version
  end

  class Target
    include FileUtils

    def initialize(dir)
      raise ArgumentError, %{Invalid directory: #{dir}} unless File.directory?(dir)
      raise ArgumentError, %{Directory "#{dir}" is not writable} unless File.writable?(dir)
      @dir = dir
    end

    def []=(file, contents)
      dest = File.join(@dir, file)
      dest_dir = File.dirname(dest)
      mkdir_p(dest_dir) unless File.directory?(dest_dir)
      File.open(dest, 'w') do |f|
        f.write(contents)
      end
    end
  end

  class Builder
    def initialize(compress=true, support_flash=true, support_video=true)
      @compress = compress
      @support_flash = support_flash
      @support_video = support_video
    end

    def compress?
      @compress
    end

    def requires_flash?
      @support_flash || @support_video
    end

    def js_files
      files = []
      files << source('shadowbox.js')
      files << source('shadowbox-flash.js') if requires_flash?
      files << source('shadowbox-video.js') if @support_video
      files
    end

    def css_files
      files = []
      files << source('shadowbox.css')
      files << source('shadowbox-video.css') if @support_video
      files
    end

    def resource_files
      files = []
      files << source('shadowbox-icons.png')
      files << source('flowplayer.swf')
      files << root('README')
      files << root('LICENSE')
      files
    end

    def run!(target)
      date = Time.now.inspect

      # Concatenate all JavaScript files.
      js = js_files.inject('') do |m, file|
        code = File.read(file)

        # Replace @VERSION and @DATE markers in shadowbox.js.
        if File.basename(file) == 'shadowbox.js'
          code.sub!('@VERSION', Shadowbox.version)
          code.sub!('@DATE', date)
        end

        m << code
        m << "\n"
      end

      target['shadowbox.js'] = compress? ? YUICompressor.compress_js(js) : js

      # Concatenate all CSS files.
      css = css_files.inject('') do |m, file|
        code << File.read(file)

        # Replace @VERSION and @DATE markers in shadowbox.css.
        if File.basename(file) == 'shadowbox.css'
          code.sub!('@VERSION', Shadowbox.version)
          code.sub!('@DATE', date)
        end

        m << code
        m << "\n"
      end

      target['shadowbox.css'] = compress? ? YUICompressor.compress_css(css) : css

      # Copy all other resources.
      resource_files.each do |file|
        target[File.basename(file)] = File.read(file)
      end
    end

    # Returns a hash of characters that is unique to this builder's
    # configuration.
    def to_hash
      hash = ""
      hash << (@compress ? "1" : "0")
      hash << (@support_flash ? "1" : "0")
      hash << (@support_video ? "1" : "0")
      hash
    end

  private

    def root(*args)
      File.join(Shadowbox.root_dir, *args)
    end

    def source(*args)
      File.join(Shadowbox.source_dir, *args)
    end
  end
end
