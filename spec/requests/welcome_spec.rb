require 'rails_helper'

RSpec.describe "Welcomes", type: :request do
  describe "GET /hello" do
    it "returns http success" do
      get "/welcome/hello"
      expect(response).to have_http_status(:success)
    end
  end

end
