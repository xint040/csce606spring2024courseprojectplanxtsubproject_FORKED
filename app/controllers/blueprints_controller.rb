class BlueprintsController < ApplicationController
    layout "layouts/blueprints" 

    def index
        # sending data to 3d module
        # render '/docs/index.html'
        @snapshot = session[:snapshot]
    end
end
