require 'rails_helper'

RSpec.describe SessionsController, type: :controller do
    
    describe '#create (production)' do
        let(:omniauth_auth) do
            OmniAuth::AuthHash.new(
                provider: 'event360',
                uid: '123456',
                info: { email: 'user@example.com', name: 'John Doe' }
            )
        end

        context 'when in production environment' do
            before do
                allow(Rails.env).to receive(:production?).and_return(true)
                request.env['omniauth.auth'] = omniauth_auth
            end
    
            it 'logs in the user and redirects to plans_path on successful authentication' do
                user = User.new(
                    email: 'user@example.com',
                    name: 'John Doe',
                )
                
                allow(User).to receive(:from_omniauth).and_return(user)
    
                post :create, params: { provider: 'event360' }
    
                expect(session[:user_email]).to eq('user@example.com')
                expect(response).to redirect_to(plans_path)
                expect(flash[:notice]).to eq('Logged in successfully as user@example.com')
            end
    
            it 'redirects to sign_in_path with an alert message on authentication failure' do
                allow(User).to receive(:from_omniauth).and_return(nil)
    
                post :create, params: { provider: 'event360' }
    
                expect(response).to redirect_to(root_path)
                expect(flash[:alert]).to eq('Invalid request')
            end
        end
    end
    
    describe '#create (!production)' do
        it 'logs in a user' do
            user = User.create(name: "Any Name", email: 'any@email.com',
            password: 'password', password_confirmation: 'password')
            get :create, params: { user: { name: user.name, email: user.email, password: user.password, password_confirmation: user.password_confirmation } }
            expect(flash[:notice]).to match('Logged in successfully')
        end
    end
    
    describe '#destroy' do
        it 'logs out a user' do
            user = User.create(name: "Any Name", email: 'any@email.com',
            password: 'password', password_confirmation: 'password')
            get :destroy, params: {id: user.id}
            expect(flash[:notice]).to match('Logged Out')
        end
    end
end