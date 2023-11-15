class SessionsController < ApplicationController
    def new; end
    def create
      if Rails.env.production?
        @user = User.from_omniauth(request.env['omniauth.auth'])
        logger.info("IN PRODUCTION")
        if @user.present?
          session[:user_id] = @user.id
          redirect_to plans_path, notice: 'Logged in successfully as ' + @user.email
        else
          flash.alert = "User not found."
          flash.now[:alert] = 'Invalid request'
          redirect_to sign_in_path, notice: 'Invalid username/email or password'
        end
      else
        logger.info("NOT IN PRODUCTION")
        user = User.find_by(email: params[:email_username])
        if !user.present?
            user = User.find_by(name: params[:email_username])
        end
        
        # finds existing user, checks to see if user can be authenticated
        if user.present? && user.authenticate(params[:password])
        # sets up user.id sessions
          session[:user_id] = user.id
          user.updated_at = Time.now
          user.save
          redirect_to plans_path, notice: 'Logged in successfully'
        else
          logger.info "wrong name or password"
          #flash.alert = "User not found."
          #flash.now[:alert] = 'Invalid email or password'
          redirect_to sign_in_path, notice: 'Invalid username/email or password'
          #render :new 
        end
      end
    end
    
    def destroy
      # deletes user session
      session[:user_id] = nil 
      redirect_to root_path, notice: 'Logged Out'
    end
end
