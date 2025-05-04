#!/usr/bin/env ruby

require 'fileutils'
require 'yaml'

# Caption configurations
CAPTIONS = {
  'en-US' => {
    'onboarding' => 'Your Voice Companion',
    'chat' => 'Intelligent Conversations',
    'reminder' => 'Never Miss a Moment',
    'sos' => 'One-Tap Emergency Help',
    'dashboard' => 'Your Care Dashboard',
    'settings' => 'Accessibility Settings',
    'emotion' => 'Track Your Emotions',
    'admin' => 'Admin Dashboard'
  },
  'ar' => {
    'onboarding' => 'رفيقك الصوتي',
    'chat' => 'محادثات ذكية',
    'reminder' => 'لا تفوت أي لحظة',
    'sos' => 'مساعدة طارئة بنقرة واحدة',
    'dashboard' => 'لوحة تحكم رعايتك',
    'settings' => 'إعدادات إمكانية الوصول',
    'emotion' => 'تتبع مشاعرك',
    'admin' => 'لوحة تحكم المسؤول'
  },
  'es' => {
    'onboarding' => 'Tu Compañero de Voz',
    'chat' => 'Conversaciones Inteligentes',
    'reminder' => 'Nunca Olvides un Momento',
    'sos' => 'Ayuda de Emergencia en un Toque',
    'dashboard' => 'Tu Panel de Cuidado',
    'settings' => 'Configuración de Accesibilidad',
    'emotion' => 'Seguimiento de Emociones',
    'admin' => 'Panel de Administración'
  },
  'hi' => {
    'onboarding' => 'आपका वॉइस कंपैनियन',
    'chat' => 'बुद्धिमान बातचीत',
    'reminder' => 'कभी कोई पल न चूकें',
    'sos' => 'एक टैप इमरजेंसी सहायता',
    'dashboard' => 'आपका केयर डैशबोर्ड',
    'settings' => 'एक्सेसिबिलिटी सेटिंग्स',
    'emotion' => 'अपनी भावनाओं को ट्रैक करें',
    'admin' => 'एडमिन डैशबोर्ड'
  },
  'zh-Hans' => {
    'onboarding' => '您的语音助手',
    'chat' => '智能对话',
    'reminder' => '不错过任何时刻',
    'sos' => '一键紧急求助',
    'dashboard' => '您的护理仪表板',
    'settings' => '无障碍设置',
    'emotion' => '情绪追踪',
    'admin' => '管理面板'
  }
}

# Font configurations
FONTS = {
  'en-US' => 'SF-Pro-Display-Bold',
  'ar' => 'Cairo-Bold',
  'es' => 'SF-Pro-Display-Bold',
  'hi' => 'Noto-Sans-Devanagari-Bold',
  'zh-Hans' => 'PingFang-SC-Bold'
}

# Style configurations
STYLES = {
  'chat' => {
    type: 'bubble',
    background: 'rgba(0,0,0,0.7)',
    padding: '20x10',
    radius: '20'
  },
  'emotion' => {
    type: 'gradient',
    colors: ['#FF6B6B', '#4ECDC4'],
    background: 'rgba(0,0,0,0.7)',
    padding: '15x5'
  },
  'default' => {
    type: 'overlay',
    background: 'rgba(0,0,0,0.7)',
    padding: '10x5'
  }
}

def get_style(flow)
  STYLES[flow] || STYLES['default']
end

def add_caption(image_path, caption, language, flow)
  # Get appropriate font and style
  font = FONTS[language] || 'SF-Pro-Display-Bold'
  style = get_style(flow)
  
  # Base ImageMagick command
  command = ['convert', image_path]
  
  case style[:type]
  when 'bubble'
    # Add bubble-style caption
    command.concat([
      '-background', style[:background],
      '-fill white',
      "-font \"#{font}\"",
      '-gravity center',
      language == 'zh-Hans' ? '-pointsize 36' : '-pointsize 40',
      "-annotate +0+0 \"#{caption}\"",
      '-shadow 80x3+0+0',
      '-bordercolor', style[:background],
      "-border #{style[:padding]}",
      "-roundrectangle 0,0,%[fx:w],%[fx:h],#{style[:radius]},#{style[:radius]}"
    ])
  when 'gradient'
    # Add gradient-style caption
    command.concat([
      '-background', "gradient:#{style[:colors].join('-')}",
      '-fill white',
      "-font \"#{font}\"",
      '-gravity center',
      language == 'zh-Hans' ? '-pointsize 36' : '-pointsize 40',
      "-annotate +0+0 \"#{caption}\"",
      '-shadow 80x3+0+0'
    ])
  else
    # Add default overlay caption
    command.concat([
      '-background', style[:background],
      '-fill white',
      "-font \"#{font}\"",
      '-gravity center',
      language == 'zh-Hans' ? '-pointsize 36' : '-pointsize 40',
      "-annotate +0+0 \"#{caption}\"",
      '-shadow 80x3+0+0'
    ])
  end
  
  # Add platform-specific adjustments
  if image_path.include?('android')
    command.concat(['-resize', '1080x1920'])
  end
  
  # Add output path
  command << image_path
  
  # Execute command
  system(command.join(' '))
end

def process_screenshots(platform = 'ios')
  screenshots_dir = "../fastlane/metadata/#{platform}/screenshots"
  
  Dir.glob("#{screenshots_dir}/**/*.png").each do |image_path|
    # Extract language and flow from path
    if image_path =~ /(\w{2}-\w{2})\/(\w+)_/
      language = $1
      flow = $2
      
      if CAPTIONS[language] && CAPTIONS[language][flow]
        add_caption(image_path, CAPTIONS[language][flow], language, flow)
        puts "Added caption to #{image_path}"
      end
    end
  end
end

# Main execution
platform = ARGV[0] || 'ios'
process_screenshots(platform) 