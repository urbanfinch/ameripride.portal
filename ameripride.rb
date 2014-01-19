require 'zip'

get '/' do
  File.read(File.join('public', 'index.html'))
end

get '/download/:package/?' do
  begin
    directory = "public/presentations/#{params[:package].chop}/"
    zip = "#{settings.root}/tmp/#{params[:package]}"
    
    if params[:regenerate] && File.exists?(zip)
      File.delete(zip)
    end
    
    if !File.exists?(zip)
      Zip::File.open(zip, Zip::File::CREATE) do |zipfile|
          Dir[File.join(directory, '**', '**')].each do |file|
            zipfile.add(file.sub(directory, ''), file)
          end
      end
    end
    
    send_file zip, :type => 'application/zip'
  rescue
    status 500
  end
end