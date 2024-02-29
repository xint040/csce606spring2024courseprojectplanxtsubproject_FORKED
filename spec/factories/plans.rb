FactoryBot.define do
    factory :plan do
      name { "Sample Plan" }
      owner { "Sample Owner" }
      timezone { "UTC" }
      venue_length { 10 }
      venue_width { 5 }
    end
  end
  