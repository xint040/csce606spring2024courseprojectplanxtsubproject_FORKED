module ApplicationHelper
    def link_to_add_fields(name, step_form, association)
    ## create a new object from the association (:product_variants)
    new_object = step_form.object.send(association).klass.new

    ## just create or take the id from the new created object
    id = new_object.object_id

    ## create the fields form
    fields = step_form.fields_for(association, new_object, child_index: id) do |builder|
        render(association.to_s.singularize + "_field", step_form: builder)
    end
    ## pass down the link to the fields form
    link_to(name, '#', class: 'btn btn-secondary add_fields', data: {id: id, fields: fields.gsub("\n", "")})

    end
end
