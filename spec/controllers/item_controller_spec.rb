require 'rails_helper'

RSpec.describe ItemsController, type: :controller do
    let!(:plan) do
    Plan.create!(name: 'Test1', owner: 'Morris', venue_length: 100, venue_width: 100)
    end

    before do
        plan.steps.create!(
            start_date: '2021-04-01',
            start_time: '2021-04-01 10:00:00',
            end_time: '2021-04-01 11:00:00',
            break1_start_time: '2021-04-01 10:30:00',
            break1_end_time: '2021-04-01 10:45:00',
            break2_start_time: '2021-04-01 10:30:00',
            break2_end_time: '2021-04-01 10:45:00'
        )
        
    end

    describe 'when trying to add the item to the step' do
        it 'add the item to the database' do
            
            post :create, params: { item: { name: 'Test3', model: 'Chair', width: 100, length: 100, depth: 100, rotation: 100, description: 'Test', xpos: 100, ypos: 100, zpos: 100, step_id: plan.steps.last.id } }
            item = Item.last
            expect(item.name).to eq('Test3')
            expect(item.model).to eq('Chair')
            expect(item.width).to eq(100)
            expect(item.length).to eq(100)
            expect(item.depth).to eq(100)
            expect(item.rotation).to eq(100)
            expect(item.description).to eq('Test')
            expect(item.xpos).to eq(100)
            expect(item.ypos).to eq(100)
            expect(item.zpos).to eq(100)
            expect(item.step_id).to eq(plan.steps.last.id)
        end

        context 'with invalid parameters' do
            let(:invalid_attributes) { { name: nil, model: 'Chair', width: 100, length: 100, depth: 100 } }

            it 'does not create a new Item' do
                expect {
                post :create, params: { item: invalid_attributes }, format: :json
                }.not_to change(Item, :count)
            end

            it 'returns a status code of unprocessable_entity' do
                post :create, params: { item: invalid_attributes }, format: :json
                expect(response).to have_http_status(:unprocessable_entity)
            end
        end
    end

    describe 'when trying to search the item with step id' do
        before { 
            step_id = plan.steps.last.id
            post :create, params: { item: { name: 'item1', model: 'Chair', width: 100, length: 100, depth: 100, rotation: 100, description: 'Test', xpos: 100, ypos: 100, zpos: 100, step_id: step_id} }
            post :create, params: { item: { name: 'item2', model: 'Blue Chair', width: 100, length: 100, depth: 100, rotation: 100, description: 'Test', xpos: 100, ypos: 100, zpos: 100, step_id: step_id} }
            get :search, params: { step_id: step_id }, format: :json 
        }
        
        it 'returns a successful response' do
            expect(response).to have_http_status(:success)
        end

        it 'returns the correct items as JSON' do
            expect(response.content_type).to eq('application/json; charset=utf-8')

            json_response = JSON.parse(response.body)
            expect(json_response.size).to eq(2) # Expecting 2 items from step1

            # Optionally, check for specific attributes in the JSON response
            expect(json_response.first['step_id']).to eq(plan.steps.last.id )
        end
    end
end
