let show_all = false;
let showall_checkbox = document.getElementById("show_all");
showall_checkbox.checked = show_all;
let cnt = 0;
let server_plan_obj;
let server_url;
let x, y, offsetx, offsety;
let canvas = document.getElementById("dest_copy");
let editable = true;
let tableItems = document.getElementById("tableItems");
let time = 0;
let ctx = canvas.getContext("2d");
let scale = 50;
let top_selected = true;
let fur_selected = true;
let elec_selected = true;
let staff_selected = true;
let defaultSize = new Map();
let selected_icon_id = -1;
let date_list = [];
let breakdown_time = [];
let conflict_groupid;
defaultSize.set("rect_room", [200, 200]);
defaultSize.set("round_room", [200, 200]);
defaultSize.set("triangle_room", [200, 200]);
defaultSize.set("couch", [20, 20]);
defaultSize.set("camera", [25, 20]);
defaultSize.set("speaker", [35, 30]);

// timebar_checkbox.addEventListener("click", function(){
//     timebar_checked = !timebar_checked;
//     console.log("timebar_checked: ", timebar_checked);
//     // if (this.checked) {
//     //     // Execute some JavaScript function here
//     //     console.log("Checkbox is checked!");
//     //     timebar_checked = true;
//     // } else {        
//     //     console.log("Checkbox is not checked.");
//     //     timebar_checked = false;
//     // }
// });   

clickToShowAll = function(){
    show_all = !show_all;
    console.log("show_all: ", show_all);
    plan.draw();
}

class TimeExpression {
  constructor(expression) {
    if(expression){
      this.expression = expression;
    }
    else {
      this.expression = "Invalid";
    }
    this.timebar_value = -1.0;
  }
  toDisplayTime(){
    if(this.timebar_value < 0){
      return "Invalid";
    }
    let day_index = parseInt(this.timebar_value / 24);
    // console.log("dayyyyyyy", day_index);
    let hours = parseInt(this.timebar_value - day_index * 24);
    let minutes = Math.round((this.timebar_value - day_index * 24 - hours) * 60);
    // console.log(date_list, date_list[0]);
    return date_list[day_index] + '/' +String("0" + hours).slice(-2) + ':' + String("0" + minutes).slice(-2);
  }

  calculateStartTime(){
    var timeRe = /^\d{2}\/\d{2}\/\d+:\d{2}$/i;
    var relativeRe = /^t\d+\+\d+:\d{2}/i;
    if(timeRe.test(this.expression)){
      var matched_data = this.expression.match(/\d+/g);
      var day_string = this.expression.substring(0,5);
      var hours = parseInt(matched_data[2]);
      var minutes = parseFloat(matched_data[3]);
      var day_index = -1;
      for(let i = 0; i< date_list.length; i++){
        if(day_string == date_list[i]){
          day_index = i;
          break;
        }
      }
      if(day_index < 0 || hours > 24 || hours < 0 || minutes > 60 || minutes < 0){
        this.timebar_value = -1.0;
        return;
      }
      this.timebar_value = 24 * day_index + hours + minutes / 60.0;
      //console.log("time bar value: ", this.timebar_value);
      for(let i = 0; i< breakdown_time.length; i++){
        if(this.timebar_value > breakdown_time[i][0] && this.timebar_value < breakdown_time[i][1]){
          alert("Current Start time is inside break down time!");
          this.timebar_value = -1.0;
        }
      }
      return;
    }
    else if (relativeRe.test(this.expression)) {
      var matchedData = this.expression.match(/\d+/g);
      var parentId = matchedData[0];
      var offset = parseFloat(matchedData[1]) + parseFloat(matchedData[2]) / 60.0;
      // For start time, partentID can be equal to childID. Examle: TE11 = TS11 + 5.
      // Self addition is not allowed. Example: TS11 = TS11 + 1.
      if(plan.items.get(parseInt(parentId))){
        var parentValue = plan.items.get(parseInt(parentId)).setup_start.timebar_value;
        if(parentValue >= 0){
          this.timebar_value = addBreakdownTime(parentValue, offset, 0);
          return;
        }
      }
    }
    this.timebar_value = -1.0;
    return;
  }
  calculateEndTime(parentTime){
    var timeRe = /^\d+:\d{2}$/i;
    if (timeRe.test(this.expression)){
      var matchedData = this.expression.match(/\d+/g);
      var offset = parseFloat(matchedData[0]) + parseFloat(matchedData[1]) / 60.0;
      if(parentTime){
        var parentValue = parentTime.timebar_value;
        if(parentValue >= 0){
          this.timebar_value = addBreakdownTime(parentValue, offset, 0);
          return;
        }
      }
    }
    this.timebar_value = -1.0;
    return;
  }
}

function addBreakdownTime(parentValue, offset, breakdown_time_index){
  if(offset == 0){
    return parentValue;
  }
  if(breakdown_time_index >= breakdown_time.length){
    return parentValue + offset;
  }
  if(breakdown_time[breakdown_time_index][0] < parentValue){
    return addBreakdownTime(parentValue, offset, breakdown_time_index + 1);
  }
  var avaliable_time = breakdown_time[breakdown_time_index][0] - parentValue;
  if(avaliable_time <= offset){
    var breakdown_time_interval = breakdown_time[breakdown_time_index][1] - breakdown_time[breakdown_time_index][0];
    return addBreakdownTime(parentValue + avaliable_time + breakdown_time_interval, offset - avaliable_time, breakdown_time_index + 1);
  }
  else{
    return parentValue + offset;
  }
}

// let canvasWidth = canvas.width;
// let canvasHeight = canvas.height;
// var canvas = document.getElementById("canvas");
var graphs = [];
// var graphAttr = [
//     { x: 20, y: 120, w: 100, h: 60, bgColor: "rgba(111, 84, 153 , 0.8)", canvasObj: canvas },
//     { x: 70, y: 60, w: 50, h: 50, bgColor: "rgba(0, 33, 66 , 0.8)", canvasObj: canvas, shape: "circle" },
//     { x: 20, y: 130, w: 70, h: 70, bgColor: "rgba(228, 134, 50 , 0.8)", canvasObj: canvas, shape: "triangle" }

// ];
var tempGraphArr = [];
dragGraph = function (id, x, y, w, h, strokeStyle, canvas, graphShape, rotate, lineWidth, onselected) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.rotate = rotate;
    this.strokeStyle = strokeStyle || "rgba(245, 245, 245, 1)";
    // this.strokeStyle = strokeStyle || "rgba(26, 188, 156, 1)";
    // this.strokeStyle = strokeStyle || "white";
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.canvasPos = canvas.getBoundingClientRect();
    this.graphShape = graphShape;
    this.lineWidth = lineWidth;
    this.showtext = onselected;
}

dragGraph.prototype = {
    paint: function () {
        this.context.beginPath();
        this.context.strokeStyle = this.strokeStyle;
        this.shapeDraw();
    },
    isMouseInGraph: function (mouse) {
        this.context.beginPath();
        this.context.strokeStyle = "rgba(0, 0, 0, 0)";
        // this.context.strokeStyle = 'rgba'
        this.shapeDraw();
        this.context.strokeStyle = this.strokeStyle;
        let res = this.context.isPointInPath(mouse.x, mouse.y);
        return res;
    },

    shapeDraw: function () {
        let ctx = this.context;
        ctx.lineWidth = this.lineWidth;

        if (this.graphShape == "rect_room"){
            // console.log(this.x, this.y, this.w, this.h)
            // console.log(canvas.width, canvas.height, canvasWidth, canvasHeight);
            // first save the ctx
            ctx.save();
            // then translate to the new center
            ctx.translate(this.x, this.y);
            // rotate canvas
            ctx.rotate(this.rotate * Math.PI / 180);
            // come back
            ctx.translate(-this.x, -this.y);
            // draw a rect room
            ctx.rect(this.x-this.w/2, this.y-this.h/2, this.w, this.h);
            ctx.setLineDash([3, 6]);
            ctx.stroke();
            ctx.closePath();
            // restore
            ctx.restore();
        }
        else if (this.graphShape == "round_room"){
            // save the ctx
            ctx.save();
            // translate
            ctx.translate(this.x, this.y);
            // rotate
            ctx.rotate(this.rotate * Math.PI / 180);
            // tranlate back
            ctx.translate(-this.x, -this.y);
            // draw a round room
            ctx.arc(this.x, this.y, this.w/2, 0, Math.PI * 2);
            ctx.setLineDash([3, 6]);
            ctx.stroke();
            ctx.closePath();
            // restore
            ctx.restore();
        }
        else if (this.graphShape == "triangle_room"){
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotate * Math.PI / 180);
            ctx.translate(-this.x, -this.y);
        
            // draw a triangle room
            ctx.moveTo(this.x, this.y - this.h / 2);
            ctx.lineTo(this.x + this.w / 2, this.y + this.h / 2);
            ctx.lineTo(this.x - this.w / 2, this.y + this.h / 2);
            ctx.closePath();
            ctx.setLineDash([3, 6]);
            ctx.stroke();
            ctx.restore();
        }
        else if (this.graphShape == "couch"){
            // console.log(this.w, this.h);
            // first save the ctx
            ctx.save();
            // then translate the rotating center to the icon center
            ctx.translate(this.x, this.y);
            // console.log("translate to a new center", this.x, this.y);
            // then rotate the canvas
            ctx.rotate(this.rotate * Math.PI / 180);
            // come back to the origin center
            ctx.translate(-this.x, -this.y);
            // then draw the icon
            ctx.setLineDash([1, 0]);
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.w / 2, this.y);
            ctx.lineTo(this.x + this.w / 2, this.y + this.h / 2);
            ctx.lineTo(this.x - this.w / 2, this.y + this.h / 2);
            ctx.lineTo(this.x - this.w / 2, this.y - this.h / 2);
            ctx.lineTo(this.x, this.y - this.h / 2);
            ctx.closePath();
            ctx.stroke();
            // restore to the original status
            ctx.restore();
        }
        else if (this.graphShape == "camera"){

            // save the ctx
            ctx.save();
            // then translate the rotating center to the icon center
            ctx.translate(this.x, this.y);
            // console.log("translate to a new center", this.x, this.y);
            // then rotate the canvas
            ctx.rotate(this.rotate * Math.PI / 180);
            // come back to the origin center
            ctx.translate(-this.x, -this.y);            
            
            // plot the camera.jpg on the canvas
            var img = new Image();
            img.src = "../../frontend/pic/camera.png";
            ctx.drawImage(img, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);          
            
            // draw a rect to cover the camera
            ctx.rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
            ctx.setLineDash([3, 6]);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();

        }       
        else if (this.graphShape == "speaker"){
            // save the ctx
            ctx.save();
            // then translate the rotating center to the icon center
            ctx.translate(this.x, this.y);
            // console.log("translate to a new center", this.x, this.y);
            // then rotate the canvas
            ctx.rotate(this.rotate * Math.PI / 180);
            // come back to the origin center
            ctx.translate(-this.x, -this.y);            
            
            // plot the camera.jpg on the canvas
            var img = new Image();
            img.src = "../../frontend/pic/speaker.png";
            ctx.drawImage(img, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);          
            
            // // draw a rect to cover the img
            ctx.rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
            ctx.setLineDash([3, 6]);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();

        }
        // if(this.id == selected_icon_id){
        //     ctx.fillStyle = 'orange';
        //     ctx.fill();
        // }

        // show a textbox when mouse clicked on the icon, the textbox shows the icon's id, name, width, length, description.
        if (this.showtext) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0)';
            ctx.fillRect(this.x - this.w / 2, this.y - this.h / 2 - 20, 200, 15);
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.fillText("id:"+this.id + ", " + this.graphShape + ", w:" + this.w + ", h:" + this.h, this.x - this.w / 2, this.y - this.h / 2 - 10);
        }

    },
    erase: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

canvas.addEventListener('click', function(e) {
    var mouse = {
        x: e.clientX - canvas.getBoundingClientRect().left,
        y: e.clientY - canvas.getBoundingClientRect().top
    };
    graphs.forEach(function (shape) {
        let id = shape.id;
        if (shape.isMouseInGraph(mouse)) {
            if (layer(shape.graphShape) == "top" && !top_selected) {
                plan.items.get(id).onselected = false;
            } else {
                plan.items.get(id).onselected = true;
            }
        } else {
            plan.items.get(id).onselected = false;
        }
    });
    plan.draw();
    plan.generateTable();
    e.preventDefault();
}, false);

canvas.addEventListener("mousedown", function (e) {
    // avoid right click moving
    if(e.button == 1 || e.button == 2){
        return;
    }
    var mouse = {
        x: e.clientX - canvas.getBoundingClientRect().left,
        y: e.clientY - canvas.getBoundingClientRect().top
    };
    // console.log("mouse position ssssss", mouse.x, mouse.y);
    // "shape" here represents the object of dragGraph
    graphs.forEach(function (shape) {
        var offset = {
            x: mouse.x - shape.x,
            y: mouse.y - shape.y
        };
        if (shape.isMouseInGraph(mouse)) {
            if(layer(shape.graphShape) == "top" && !top_selected){
                return;
            }
            // console.log("cc");
            let id = shape.id;
            tempGraphArr.push(shape);
            canvas.addEventListener("mousemove", function (e) {
                mouse = {
                    x: e.clientX - canvas.getBoundingClientRect().left,
                    y: e.clientY - canvas.getBoundingClientRect().top
                };

                if (shape === tempGraphArr[0]) {
                    shape.x = mouse.x - offset.x;
                    shape.y = mouse.y - offset.y;

                    shape.erase();
                    // shape.paint();
                    // console.log("paint in here");
                    // graphs.forEach(function(graph){
                    //     graph.paint();
                    // })
                    plan.items.get(id).pos_x = (mouse.x - offset.x) * scale / 50;
                    plan.items.get(id).pos_y = (mouse.y - offset.y) * scale / 50;
                    // drawGraph();

                    plan.draw();
                }
            }, false);
            canvas.addEventListener("mouseup", function () {
                tempGraphArr = [];
            }, false);
        }
    });
    e.preventDefault();
}, false);
// right click to edit the icons
canvas.addEventListener("contextmenu", function(e){
    var mouse = {
        x: e.clientX - canvas.getBoundingClientRect().left,
        y: e.clientY - canvas.getBoundingClientRect().top
    };
    graphs.forEach(function (shape){
        var offset = {
            x: mouse.x - shape.x,
            y: mouse.y - shape.y
        };
        if (shape.isMouseInGraph(mouse)) {
            if(layer(shape.graphShape) == "top" && !top_selected){
                return;
            }
            //
            closeMenu();
            rightClick(e, mouse, shape.id);
        }
    });
    e.preventDefault();
}, false);

function layer(item_shape) {
    // return which layer a item belongs to
    if ((item_shape == "rect_room" || item_shape == "round_room" || item_shape == "triangle_room")) {
        return "top";
    } else if (item_shape == "couch") {
        return "furniture";
    } else if (item_shape == "camera" || item_shape == "wire"){
        return "electrical";
    } else if (item_shape == "speaker"){
        return "staff";
    }

    return;
}

function rightClick(e, mouse, id){
    if(editable == false){
        return;
    }
    e.preventDefault();
    closeMenu();
    let menu = createMenu(e, mouse, id);
    // console.log(typeof(menu), "vvvvv");
    document.getElementById("canvas_div").appendChild(menu);
}
function createMenu(e, mouse, id){
    console.log("create menu");
    // x = e.clientX;
    // y = e.clientY;
    x = mouse.x;
    y = mouse.y;
    // console.log(x, y);
    let newDiv = document.createElement("ul");
    newDiv.id = "deletionMenu";
    newDiv.setAttribute("class", "context-menu");
    newDiv.style.cssText = `position: absolute; left: ${x}px; top: ${y}px;`;
    let sub1 = createOptionsInMenu(e, "delete", id, mouse);
    let sub2 = createOptionsInMenu(e, "edit", id, mouse);
    newDiv.appendChild(sub1);
    newDiv.appendChild(sub2);
    return newDiv;
}
// str represents the text
function createOptionsInMenu(e, str, id, mouse){
    let opt = document.createElement("li");
    opt.textContent = str;
    opt.setAttribute("onclick", `${str}Item(${id}, ${mouse.x}, ${mouse.y});`);
    return opt;
}
// select deletion
function deleteItem(id, mouse_x, mouse_y){
    console.log("complete deletion");
    // document.getElementById(id).remove();
    // console.log("yyyy",typeof(id))
    plan.deleteItem(id);
    plan.generateTable();
    plan.draw();
}
function editItem(id, mouse_x, mouse_y){
    let curItem = plan.items.get(id);
    // showEditingPage(plan.items.get(id));
    let inputForm = `
    <div class="col-sm-4 context-menu" id="editingForm" style="position: absolute; left:${mouse_x}px; top:${mouse_y}px">
        <div class="form-group">
            <label for="width">width</label>
            <div> 
                <input type="text" name="width" id="editingWidth" value="${curItem.width}" >
            </div>
            <label for="length">length</label>
            <div>
                <input type="text" name="length" id="editingLength" value="${curItem.length}">
            </div>
            <label for="description">description</label>
            <div>
                <input type="text" name="description" id="editingDescription" value="${curItem.description}">
            </div>
            <label for="rotate">rotate</label>
            <div>
                <input type="text" name="rotate" id="editingRotate" value="${curItem.rotate}"></input>
            </div>
        </div>
        <div class="">
            <button class="btn btn-white" type="submit" onclick="cancelEdit()">cancel</button>
            <button class="btn btn-primary" type="submit" onclick="submitEdit(${id})">submit</button>
        </div>
    </div>`;
    $("#canvas_div").append(inputForm);
}
function cancelEdit(){
    document.getElementById("editingForm").remove();
}
function submitEdit(id){
    console.log("idddd", id);
    let newWidth = document.getElementById("editingWidth").value;
    let newLength = document.getElementById("editingLength").value;
    let newDescription = document.getElementById("editingDescription").value;
    let newRotate = document.getElementById("editingRotate").value;
    let curItem = plan.items.get(parseInt(id));
    console.log("new stafffssss", newWidth, newLength, newDescription);
    curItem.width = newWidth;
    curItem.length = newLength;
    curItem.description = newDescription;
    console.log(curItem);
    curItem.rotate = newRotate;
    plan.generateTable();
    plan.draw();
    document.getElementById("editingForm").remove();
}
class Item{
    // item_id is the auto-generated id for each item as soon as it's constructed
    item_id;
    // layer consists of: top, furniture, electrical, and staff
    layer;
    // count_id;
    name;
    group_id;

    setup_finished;
    breakdown_finished;
    marked;
    onselected;
    dependency_conflict;

    // type should be consistent with the id of the items in the repository shown in HTML
    type;
    pos_x;
    pos_y;
    rotate;
    width;
    length;
    description;
    lineWidth;
    constructor(){
        this.setup_finished = false;
        this.breakdown_finished = false;
        this.marked = false;
        this.onselected = false;
        this.dependency_conflict = false;
        this.group_id = 0;
    }
    //calculateExpression(value.start_time, value.item_id)
    draw(){
        if( !show_all && (plan.group_manager.get_setup_start(this.group_id).timebar_value > time || plan.group_manager.get_breakdown_duration(this.group_id).timebar_value < time)){
            return;
        }
        if((this.layer == "furniture" && !fur_selected) || (this.layer == "electrical" && !elec_selected) || (this.layer == "staff" && !staff_selected)){
            return;
        }
        if(this.layer == "top"){
            this.strokeStyle = "blue";
        }
        if(this.layer == "furniture"){
            this.strokeStyle = "rgba(241, 174, 28, 1)";
        }
        if(this.layer == "electrical"){
            // this.strokeStyle = "green";
            this.strokeStyle = "rgba(245, 245, 245, 1)";
        }
        if(this.layer == "staff"){
            // this.strokeStyle = "red";
            this.strokeStyle = "rgba(245, 245, 245, 1)";
        }
        
        this.lineWidth = (this.onselected ? 3 : 1);
        this.strokeStyle = (this.onselected ? "red" : this.strokeStyle);
        this.lineWidth = (this.marked ? 3 : this.lineWidth);
        this.strokeStyle = (this.marked ? "red" : this.strokeStyle);

        // console.log("thishishihsihs");
        let graph = new dragGraph(this.item_id, this.pos_x * 50 / scale, this.pos_y * 50 / scale, 
                                  this.width * 50 / scale, this.length * 50 / scale, this.strokeStyle, 
                                  canvas, this.type, this.rotate, this.lineWidth, this.onselected);

        // if(this.type == "rect_room"){
        //     console.log("new graph", graph, this.type)
        // }
        graphs.push(graph);
        graph.paint();
    }
}
class group {
    constructor(group_id, group_name) {
        this.id = group_id;
        this.name = group_name;
        this.owner = "None";
        this.depend_id = 0;
        
        let current_time = new TimeExpression();
        current_time.timebar_value = document.getElementById("timebar").value;
        this.setup_start = new TimeExpression(current_time.toDisplayTime());
        this.setup_duration  = new TimeExpression("1:00");
        this.breakdown_start = new TimeExpression(current_time.toDisplayTime());
        this.breakdown_duration = new TimeExpression("1:00");
  
        this.item_cnt = 1;
    }
}
class GroupManager {
    constructor() {
        this.groups = new Array();
        
        this.name2id = new Object();
        this.id2name = new Object(); 

        // dummy class for every newly created item
        this.groups.push(new group(0));
        this.id2name[0] = "Default";
        this.name2id["Default"] = 0;
    }
    
    // check whether the group already exist:
    // if yes, return the corresponding group_id;
    // if no, create a new group and return group_id of the new group;
    generate_group_id(curr_id, new_name) {
        let new_id;
        if (new_name in this.name2id) {
            new_id = this.name2id[new_name];
            this.groups[new_id].item_cnt++;
        } else {
            new_id = this.#create_group(new_name);
        }
        this.check_group_usage(curr_id);
        return new_id;
    }
    
    get_group_name(id) { 
        console.assert(this.groups[id] != null, `group_manager: get_group_name: accessing groups with invalid group_id ${id}`);
        return this.id2name[id];
    }
    
    get_owner(id) { 
        console.assert(this.groups[id] != null, `group_manager: get_owner: accessing groups with invalid group_id ${id}`);
        return this.groups[id].owner; 
    }
    
    set_owner(id, owner) {
        console.assert(this.groups[id] != null, `group_manager: set_group_owner: accessing groups with invalid group_id ${id}`);
        this.groups[id].owner = owner;
    }
    
    update_times() {
        for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i] != null) {
                this.groups[i].setup_start.calculateStartTime();
                this.groups[i].setup_duration.calculateEndTime(this.groups[i].setup_start);
                this.groups[i].breakdown_start.calculateStartTime(this.groups[i].setup_start);
                this.groups[i].breakdown_duration.calculateEndTime(this.groups[i].breakdown_start);
            }
        }
        this.check_group_depend_conflict();
        
        // console.log("Group Usage:")
        // for (let i = 0; i < this.groups.length; i++) {
        //     if (this.groups[i] != null) {
        //         console.log(`group id: ${i} with item_cnt: ${this.groups[i].item_cnt}`);
        //     }
        // }
    }
    
    set_setup_start(id, expr_obj)        { this.groups[id].setup_start = expr_obj; }
    set_setup_duration(id, expr_obj)     { this.groups[id].setup_duration = expr_obj; }
    set_breakdown_start(id, expr_obj)    { this.groups[id].breakdown_start = expr_obj; }
    set_breakdown_duration(id, expr_obj) { this.groups[id].breakdown_duration = expr_obj; }

    get_setup_start(id)                  { return this.groups[id].setup_start; }
    get_setup_duration(id)               { return this.groups[id].setup_duration; }
    get_breakdown_start(id)              { return this.groups[id].breakdown_start; }
    get_breakdown_duration(id)           { return this.groups[id].breakdown_duration; }
    
    set_depend_group(curr_id, depend_name) {
        if (!(depend_name in this.name2id)) {
            this.groups[curr_id].depend_id = 0;
        } else {
            let depend_id = this.name2id[depend_name];
            this.groups[curr_id].depend_id = depend_id;
        }
    }
    
    get_depend_group(id) {
        console.assert(this.groups[id] != null, `group_manager: set_group_owner: accessing groups with invalid group_id ${id}`);
        let depend_name = this.id2name[this.groups[id].depend_id];
        return depend_name;
    }
    
    check_group_depend_conflict() {
        let msg = "";
        let conflict_groupid = new Map ();

        for (let i = 1; i <= this.groups.length; i++) {
            if (this.groups[i] != null && this.groups[i].depend_id != 0) {
                let cur_id = i;
                let dep_id = this.groups[i].depend_id;
                
                // check setup conflict
                if (this.get_setup_start(cur_id).toDisplayTime() < this.get_setup_duration(dep_id).toDisplayTime()) {
                    msg += `<br>Conflict: ${this.id2name[cur_id]} begins to setup before its dependency ${this.id2name[dep_id]} finishing setup.`;
                    conflict_groupid.set(cur_id, true);                   
                }
                
                // check breakdown conflict
                if (this.get_breakdown_duration(cur_id).toDisplayTime() > this.get_breakdown_start(dep_id).toDisplayTime()) {
                    msg += `<br>Conflict: ${this.id2name[dep_id]} begins to breakdown before its dependency ${this.id2name[cur_id]} finishing breakdown.`;
                    conflict_groupid.set(cur_id, true);    
                }

            }
        }
        return {'message':msg,
                'conflict_groupid': conflict_groupid};                
    }
    
    #create_group(name) {
        let id = this.#find_freed_id();
        this.groups.splice(id, 1, new group(id, name));
        this.name2id[name] = id;
        this.id2name[id] = name;
        // console.log(`group_manager: create_group: new group ${name} is created with id ${id}`);
        return id;
    }
    
    check_group_usage(curr_id) {
        // console.log(`check group usage: group id = ${curr_id}`);
        if (curr_id == 0) { return; }
        if (--this.groups[curr_id].item_cnt == 0) {
            // console.log(`group_manager: check_group_usage: group ${this.id2name[curr_id]} no longer in use, deleting` );
            this.#delete_group(curr_id);
            this.#check_group_depend(curr_id);
        }
    }
    
    // set depend_id to default if its depend group is deleted
    #check_group_depend(id) {
        for (let i = 1; i <= this.groups.length; i++) {
            if (this.groups[i] != null && this.groups[i].depend_id == id) {
                this.groups[i].depend_id = 0;
            }
        }
    }
    
    #delete_group(id) {
        let name = this.id2name[id];
        this.groups[id] = null;
        delete this.name2id[name];
        delete this.id2name[id];
    }
    
    #find_freed_id() {
        let id = -1;
        for (let i = 1; i <= this.groups.length; i++) {
            if (this.groups[i] == null) {
                id = i;
                break;
            }
        }
        console.assert(id != -1, "group_manager: cannot find freed id");
        return id;
    }
}
class Plan{
    items;
    items_array; // this is the array that stores all the items, it's used to implement undo and redo function
    items_operation; // this is the array that stores all the operations corresponding to each item, +1 means add, -1 means delete
    items_idx; // this is the index in the items_array, it's used to implement undo and redo function
    creator;
    current_id;
    group_manager;
    constructor(){
        // I use hashmap to store all the items to make sure the storage used is low and deleting and searching fast.
        // However, I still need to perform the sorting algorithm, I would prefer to generate a new array and then sort it by the required attribute
        // the time complexity is O(n + nlogn) = O(nlogn)
        this.items = new Map();
        this.items_array = [];
        this.items_operation = [];
        this.items_idx = -1;
        this.group_manager = new GroupManager();
    }

    // undo current operation
    undo(){
        // do nothing if there is items_array is empty, i.e. items_idx == -1
        if(this.items_idx == -1){
            return;
        }
        let item = this.items_array[this.items_idx];
        let operation = this.items_operation[this.items_idx];
        if(operation == 1){
            this.items.delete(item.item_id);
        }else{
            this.items.set(item.item_id, item);
        }
        this.items_idx--;
        this.generateTable();
        this.draw();
    }

    redo(){
        // do nothing if there is nothing in the future, or the items_array is empty, i.e. items_idx == -1
        if(this.items_idx == this.items_array.length - 1){
            return;
        }
        this.items_idx++;
        let item = this.items_array[this.items_idx];
        let operation = this.items_operation[this.items_idx];
        if(operation == 1){
            this.items.set(item.item_id, item);
        }else{
            this.items.delete(item.item_id);
        }
        this.generateTable();
        this.draw();
    }

    check_dependency(){

        let message = "";

        let res = this.group_manager.check_group_depend_conflict();
        message = res.message;
        conflict_groupid = res.conflict_groupid;
        console.log('message:', message)
        console.log('conflict_groupid:', conflict_groupid)
        this.items.forEach(markConflict);

        return message;
    }


    toJSON() {
        var t = {
            "items": Object.fromEntries(this.items),
            "creator": this.creator,
            "current_id": this.current_id,
            "groups": this.group_manager,
        }
        return JSON.stringify(t);
    }
    addItem(item, is_load = false){
        let id = item.item_id;
        if(this.items.has(id)){
            // it's wrong, as the id is self-incremented, we shouldn't have
        }else{
            this.items.set(id, item);
            if(!is_load){ // if it's not loading json, then we add it to the items_array
                this.items_array.push(item);
                this.items_operation.push(1);
                this.items_idx++;
            }

        }
    }
    deleteItem(id){
        if(this.items.has(id)){
            // has to push in the items_array and items_operation first, then delete it
            this.items_array.push(this.items.get(id));
            this.items_operation.push(-1);
            this.items_idx++;
            
            // check group usage. delete group if needed
            let item = this.items.get(id);
            this.group_manager.check_group_usage(item.group_id);
            
            this.items.delete(id);
        }else{
            // no such item
        }
    }
    draw(){
        graphs = [];
        // console.log("plan drawing");
        // console.log(this.items.size);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // while(canvas.hasChildNodes()){
        //     canvas.removeChild(canvas.firstChild);
        // }
        this.items.forEach(drawItems);
    }
    generateTable(){
        $("#tableItemsBody").remove();
        $("#tableItems").append("<tbody id='tableItemsBody'></tbody>");
        plan.group_manager.update_times();
        this.items.forEach(generateTableItems);
    }
}
var plan = new Plan();
// hashmap iteration function
function drawItems(value, key, map){
    // console.log(value);
    value.draw();
}


function markConflict(value, key, map){
    // console.log(value);
    let item_groupid = value.group_id;
    if (item_groupid != 0 && conflict_groupid.has(item_groupid)) {
        value.dependency_conflict = true;
    }
    else{
        value.dependency_conflict = false;
    }
}


function generateTableItems(value, key, map){
  let style;
  if (value.dependency_conflict){ // mark row in red if there is a dependency conflict
    style = "background-color:#F79F8D;";
  }
  else if(!value.setup_finished && !value.breakdown_finished && !value.onselected && !value.marked){
//   if(!value.setup_finished && !value.breakdown_finished && !value.onselected && !value.marked){    
    style = "display: none;";
  }
  else if ((!value.setup_finished && !value.breakdown_finished && value.onselected) || (!value.setup_finished && !value.breakdown_finished && value.marked)) { // mark row in yellow if it is selected or marked
    style = "background-color:#f6dc6f;";
  }
  else{
    style = "background-color:#bbb;";
  }
  let group_id = value.group_id;
  let item_id = value.item_id;
  let tr = `<tr>
  <td class="data" style=${style}> <input type="checkbox" id="checkbox_mark_${item_id}" onchange='clickToMark(event, ${value.item_id})'/></td>
  <td class="data" style=${style}>${item_id}</td>
  <td class="data" style=${style} onclick="clickToEditData(event, ${item_id}, 'name')">${value.name}</td>
  <td class="data" style=${style} onclick="clickToEditData(event, ${item_id}, 'group')">${plan.group_manager.get_group_name(group_id)}</td>
  <td class="data" style=${style} onclick="clickToEditData(event, ${item_id}, 'depend_group')">${plan.group_manager.get_depend_group(group_id)}</td>
  <td class="data" style=${style} onclick="clickToEditData(event, ${item_id}, 'setup_start')">${plan.group_manager.get_setup_start(group_id).toDisplayTime()}</td>
  <td class="data" style=${style} onclick="clickToEditData(event, ${item_id}, 'setup_end')">${plan.group_manager.get_setup_duration(group_id).toDisplayTime()}</td>
  <td class="data" style=${style}> <input type="checkbox" id="checkbox_setup_${item_id}" onchange='clickToChangeSetupState(event, ${item_id})'/></td>
  <td class="data" style=${style} onclick="clickToEditData(event, ${item_id}, 'breakdown_start')">${plan.group_manager.get_breakdown_start(group_id).toDisplayTime()}</td>
  <td class="data" style=${style} onclick="clickToEditData(event, ${item_id}, 'breakdown_end')">${plan.group_manager.get_breakdown_duration(group_id).toDisplayTime()}</td>
  <td class="data" style=${style}> <input type="checkbox" id="checkbox_breakdown_${item_id}" onchange='clickToChangeBreakdownState(event, ${item_id})'/></td>
  <td class="data" style=${style} onclick="clickToEditData(event, ${item_id}, 'owner')">${plan.group_manager.get_owner(group_id)}</td>
  
  </tr>`;
    
  $("#tableItemsBody").append(tr);
  document.getElementById(`checkbox_mark_${value.item_id}`).checked = value.marked;
  document.getElementById(`checkbox_setup_${value.item_id}`).checked = value.setup_finished;
  document.getElementById(`checkbox_breakdown_${value.item_id}`).checked = value.breakdown_finished;
}

function clickToSelectTop(){
    // if top is currently selected
    let bt = document.getElementById("top_selector");
    if(top_selected){
        // change the color of the button
        top_selected = false;
        console.log("sssss");
        bt.style.cssText = "background-color: rgb(145, 203, 241); border-color: rgb(145, 203, 241);";
        // change the items in the sources
        document.getElementById("top_layer_items").style.display = "none";
        // draw the items in the canvas
        plan.draw();
    }else{
        // change the color of the button
        top_selected = true;
        // bt.style.backgroundColor = "#1c84c6";
        // bt.style.borderColor = "#1c84c6"
        bt.style.cssText = "background-color: #1c84c6; border-color: #1c84c6;"
        // change the items in the sources
        document.getElementById("top_layer_items").style.display = "";
        plan.draw();
    }
}
function clickToSelectFurniture(){
    // if top is currently selected
    let bt = document.getElementById("furniture_selector");
    if(fur_selected){
        // change the color of the button
        fur_selected = false;
        bt.style.cssText = "background-color: rgb(240, 225, 161); border-color: rgb(240, 225, 161);";
        // change the items in the sources
        document.getElementById("furniture_layer_items").style.display = "none";
        // draw the items in the canvas
        plan.draw();
    }else{
        // change the color of the button
        fur_selected = true;
        bt.style.cssText = "background-color: #f8ac59; border-color: #f8ac59;"
        // change the items in the sources
        document.getElementById("furniture_layer_items").style.display = "";
        plan.draw();
    }
}
function clickToSelectElectrical(){
    // if top is currently selected
    let bt = document.getElementById("electrical_selector");
    if(elec_selected){
        // change the color of the button
        elec_selected = false;
        bt.style.cssText = "background-color: rgb(149, 223, 188); border-color: rgb(149, 223, 188);";
        // change the items in the sources
        document.getElementById("electrical_layer_items").style.display = "none";
        // draw the items in the canvas
        plan.draw();
    }else{
        // change the color of the button
        elec_selected = true;
        bt.style.cssText = "background-color: #16987e; border-color: #16987e;"
        // change the items in the sources
        document.getElementById("electrical_layer_items").style.display = "";
        plan.draw();
    }
}
function clickToSelectStaff(){
    // if top is currently selected
    let bt = document.getElementById("staff_selector");
    if(staff_selected){
        // change the color of the button
        staff_selected = false;
        bt.style.cssText = "background-color: rgb(241, 159, 153); border-color: rgb(241, 159, 153);";
        // change the items in the sources
        document.getElementById("staff_layer_items").style.display = "none";
        // draw the items in the canvas
        plan.draw();
    }else{
        // change the color of the button
        staff_selected = true;
        bt.style.cssText = "background-color: #ea394c; border-color: #ea394c;"
        // change the items in the sources
        document.getElementById("staff_layer_items").style.display = "";
        plan.draw();
    }
}
function clickToEditData(e, item_id, attr){
    selected_icon_id = item_id;
    // console.log("uuuuu", e.currentTarget.getAttribute("class"));
    let current_item = plan.items.get(parseInt(item_id));
    let table = document.getElementById("table");
    ox = table.getBoundingClientRect().left;
    oy = table.getBoundingClientRect().top;
    x = e.currentTarget.getBoundingClientRect().left;
    y = e.currentTarget.getBoundingClientRect().top;
    // console.log(item_id, x, y, ox, oy, e.currentTarget);
    // let newDiv = document.createElement("div");
    // newDiv.id = "editData";
    // newDiv.style.cssText = `position: absolute; left: ${x}px; top: ${y}px;`;
    if(document.getElementById("editData")){
        document.getElementById("editData").remove();
    }
    var dispalyText;
    let group_id = plan.items.get(item_id).group_id;
    if(attr == 'setup_start'){
        dispalyText = plan.group_manager.get_setup_start(group_id).expression;
    }
    else if (attr == 'setup_end') {
        dispalyText = plan.group_manager.get_setup_duration(group_id).expression; 
    }
    else if (attr == 'breakdown_start') {
        dispalyText = plan.group_manager.get_breakdown_start(group_id).expression; 
    }
    else if (attr == 'breakdown_end') {
        dispalyText = plan.group_manager.get_breakdown_duration(group_id).expression; 
    }
    else {
      dispalyText = e.currentTarget.innerText;
    }
    $("#table").append(`<div id="editData" style="position: absolute; left: ${x - ox + 3 + table.scrollLeft}px; top: ${y - oy + 3 + table.scrollTop}px">
    <input style="width:100px; height: 30px;" id="blankInput" type="text" onchange="changeData(event, ${item_id}, '${attr}');" value="${dispalyText}">
    </div>`);
    document.getElementById("blankInput").select();
    // let blank = `<input type="text" onchange="">`;
    // $("#editData").append(blank);

}

function clickToMark(e, item_id){
    // console.log("uuuuu", e.currentTarget.getAttribute("class"));
    let current_item = plan.items.get(parseInt(item_id));
    current_item.marked = !current_item.marked;
    plan.generateTable();
    plan.draw();
}

function clickToChangeSetupState(e, item_id){
    // console.log("uuuuu", e.currentTarget.getAttribute("class"));
    let current_item = plan.items.get(parseInt(item_id));
    current_item.setup_finished = !current_item.setup_finished;
    plan.generateTable();
}

function clickToChangeBreakdownState(e, item_id){
    // console.log("uuuuu", e.currentTarget.getAttribute("class"));
    let current_item = plan.items.get(parseInt(item_id));
    current_item.breakdown_finished = !current_item.breakdown_finished;
    plan.generateTable();
}


function changeData(e, id, attr){
    // console.log((e.value);
    let item = plan.items.get(id);
    let val = e.currentTarget.value;
    let group_id = item.group_id;
    switch (attr) {
        case 'name':
            item.name = val; 
            break;
        case 'owner':
            plan.group_manager.set_owner(group_id, val);
            break;
        case 'group':
            let new_group_id  = plan.group_manager.generate_group_id(group_id, val);
            item.group_id = new_group_id;
            break;
        case 'depend_group':
            plan.group_manager.set_depend_group(group_id, val);
            break;            
        case 'setup_start':
            plan.group_manager.set_setup_start(group_id, new TimeExpression(val)); 
            break;
        case 'setup_end':
            plan.group_manager.set_setup_duration(group_id, new TimeExpression(val));  
            break;
        case 'breakdown_start':
            plan.group_manager.set_breakdown_start(group_id, new TimeExpression(val)); 
            break;
        case 'breakdown_end': 
            plan.group_manager.set_breakdown_duration(group_id, new TimeExpression(val)); 
            break;
        default:
            console.log(`attribute ${attr} undefined`);
    }
    plan.generateTable();
    plan.draw();
    document.getElementById("editData").remove();
}
// button action
function clickToEdit(e){
    //
    editable = true;
    // console.log(editable);
    return;
}

function clickToUndo(e){

    plan.undo();

}

function clickToRedo(e){

    plan.redo();

}

function clickToCheckDependency(e){

    // flash a message to the user saying "checking dependency"
    const notification = document.getElementById("notification");
    notification.innerHTML = "Checking dependency...";
    
    message = plan.check_dependency();
    // message = '';

    if (message == "") {
        message = "Great job! No dependency violation detected!";
    }
    else {
        message = message + '<br>Please fix the dependency violation(s) by updating the time and try again!<br>Rows with dependency violation are colored in red.';
    }

    notification.innerHTML = message;

    // generte the table to colorcode the confilct rows with red
    plan.generateTable();
}

function clickToSave(e){
    console.log("Saving plan to JSON file");
    // location.reload(false);
    // editable = false;
    plan.current_id = cnt;
    
    // empty the plan.items_array
    plan.items_array = [];
    plan.items_operation = [];
    plan.items_idx = -1;

    // communicate with the server
    let str = JSON.stringify(plan);
    console.log("HERE")
    console.log(str)
    let sentObj = {
        "data":str
    }
    let sentJSON = JSON.stringify(sentObj);
    let putRequest = new XMLHttpRequest();
    putRequest.open("put", server_url);
    putRequest.setRequestHeader("Content-type", "application/json");
    putRequest.onload = function(){
        if(putRequest.readyState == 4 && putRequest.status == 200){
            console.log("connection completed");
        }else{
            console.log("error occurred");
        }
    }
    console.log(sentJSON);
    putRequest.send(sentJSON);
    return;
}

function clickToPreview(e) {
    console.log("preview");
}

function selectTheTime(){

    if (show_all == true){
        return;
    }

    // console.log("test clicking the timebar");
    let current_time = new TimeExpression();
    current_time.timebar_value = document.getElementById("timebar").value;
    time = current_time.timebar_value;
    console.log("current time is ", time);
    document.getElementById("showTimebar").innerText = `Plan Time: ${current_time.toDisplayTime()}`;
    plan.draw();
}
function selectTheScale(){
    scale = document.getElementById("scale").value;
    canvas.width = canvasWidth * 50 / scale;
    canvas.height = canvasHeight * 50 / scale;
    // console.log(canvasWidth, canvas.width);
    plan.draw();
}
function dragstart_handler(ev) {
    if(editable == false){
        return;
    }
    let dragdiv = ev.currentTarget;
    let id = dragdiv.id;
    offsetx = ev.clientX - dragdiv.getBoundingClientRect().left;
    offsety = ev.clientY - dragdiv.getBoundingClientRect().top;
    if(dragdiv.classList.contains("sourceItems")){
        dragdiv.style.opacity = 0.5;
    }
    // update the dataTransfer
    ev.dataTransfer.setData("text", ev.currentTarget.id);
    ev.dataTransfer.setDragImage(dragdiv, offsetx * 2, offsety * 2);
    // Tell the browser both copy and move are possible
    ev.effectAllowed = "copyMove";

}
function dragover_handler(ev) {
    ev.preventDefault();
    // console.log("dragOver");
}

function drop_handler(ev) {
    if(editable == false){
        return;
    }
    x = ev.clientX - canvas.getBoundingClientRect().left;
    y = ev.clientY - canvas.getBoundingClientRect().top;
    // console.log(ev.clientX, ev.clientY, canvas.getBoundingClientRect().left, canvas.getBoundingClientRect().top);
    // console.log("Drop");
    ev.preventDefault();
    let id = ev.dataTransfer.getData("text");
    let dragDiv = document.getElementById(id);
    if (dragDiv.classList.contains("sourceItems") && ev.target.id == "dest_copy") {
        // copy an item and show it on the screen
        // "true" in parentheses ensures that the entire div is copied, including deeper elements

        // var nodeCopy = dragDiv.cloneNode(true);
        // nodeCopy.id = cnt;
        // nodeCopy.style.cssText += `position: absolute; left: ${x - offsetx}px; top: ${y - offsety}px;`;
        // nodeCopy.setAttribute("oncontextmenu", "rightClick(event);");
        // nodeCopy.setAttribute("class", "items");
        // nodeCopy.setAttribute("onclick", "leftClick(event);")
        // ev.target.appendChild(nodeCopy);

        // console.log("finish")
        // create a new item, then insert it into the plan and finally update the table
        let current_item = new Item();
        current_item.name = dragDiv.id;
        current_item.item_id = parseInt(cnt);
        current_item.pos_x = x * scale / 50;
        current_item.pos_y = y * scale / 50;
        current_item.type = dragDiv.id;
        // current_item.width = 100;
        current_item.width = defaultSize.get(dragDiv.id)[0];
        current_item.length = defaultSize.get(dragDiv.id)[1];
        current_item.description = "";

        let current_time = new TimeExpression();
        current_time.timebar_value = document.getElementById("timebar").value;
        // time = current_time.timebar_value;
        // console.log("current time is ", time);
        // document.getElementById("showTimebar").innerText = `Plan Time: ${current_time.toDisplayTime()}`;

        plan.group_manager.set_setup_start(0, new TimeExpression(current_time.toDisplayTime()));
        plan.group_manager.set_setup_duration(0, new TimeExpression("1:00"));
        plan.group_manager.set_breakdown_start(0, new TimeExpression(current_time.toDisplayTime()));
        plan.group_manager.set_breakdown_duration(0, new TimeExpression("1:00"));
        
        current_item.group_id = 0;

        if(dragDiv.classList.contains("top")){
            current_item.layer = "top";
        }
        if(dragDiv.classList.contains("furniture")){
            current_item.layer = "furniture";
        }
        if(dragDiv.classList.contains("electrical")){
            current_item.layer = "electrical";
        }
        if(dragDiv.classList.contains("staff")){
            current_item.layer = "staff";
        }
        plan.addItem(current_item);
        // console.log("asss", plan.items);
        plan.generateTable();
        current_item.draw();
        // editing information
        // showEditingPage(current_item);
        // console.log(cnt);
        cnt++;
    }
    // here is a bug, when the target location is outside of the "dest_copy" but still inside
    // the current div (ev.target.id == id), it still works for the drag
    else if (dragDiv.getAttribute("class") == "items" && (ev.currentTarget.id == "dest_copy" || ev.currentTarget.id == id)) {
        dragDiv.style.cssText = "position:absolute; left: 120px; top: 240px;";
        dragDiv.style.cssText += `position: absolute; left: ${x - offsetx}px; top: ${y - offsety}px;`;
        // update the attributes of dragged div
        // console.log("w yao d id", typeof(dragDiv.id));
        // console.log(plan.items);
        let cur = plan.items.get(parseInt(dragDiv.id));
        cur.pos_x = x - offsetx;
        cur.pos_y = y - offsety;
    }

}
function dragend_handler(ev) {
    // console.log("dragEnd");
    document.getElementById(ev.currentTarget.id).style.opacity = 1;
    // Remove all of the drag data
    ev.dataTransfer.clearData();
}

// when clicking on any other space except the menu, the menu disappear
document.addEventListener('click', function(e){
    // console.log(e.target.id);
    if(e.target.getAttribute("class") != "data" && document.getElementById("editData") && e.target.id != "blankInput"){
        selected_icon_id = -1;
        document.getElementById("editData").remove();
    }
    closeMenu();
})
function leftClick(e){
    // console.log("leftClick on the item");
    let cur_id = parseInt(e.currentTarget.id);
    showEditingPage(plan.items.get(cur_id));
}
function leftClickById(id){
    showEditingPage(plan.items.get(parseInt(id)));
}
function closeMenu(){
    // console.log("clickingggggggggggggg");
    let findMenu = document.getElementById("deletionMenu");
    if(findMenu){
        findMenu.remove();
    }
}

// decode from JSON
function decodeJSON(str){
    console.log("Decoding JSON");
    if(str == null){
        return plan;
    }
    // update current cnt, it should be acquired from the JSON code
    let plan_obj = JSON.parse(JSON.parse(str));
    plan.creator = plan_obj.creator;
    plan.current_id = plan_obj.current_id;
    cnt = plan.current_id;

    // decode group info
    let group_info = plan_obj.groups;
    plan.group_manager.id2name = group_info.id2name;
    plan.group_manager.name2id = group_info.name2id;
    plan.group_manager.groups = group_info.groups;
    for (let i in plan.group_manager.groups) {
        let g = plan.group_manager.groups[i];
        g.setup_start = new TimeExpression(g.setup_start.expression);
        g.setup_duration = new TimeExpression(g.setup_duration.expression);
        g.breakdown_start = new TimeExpression(g.breakdown_start.expression);
        g.breakdown_duration = new TimeExpression(g.breakdown_duration.expression);
    }
    
    // decode items
    let cur_items = plan_obj.items;
    for(let i in cur_items){
        let cur = new Item();
        cur.item_id = cur_items[i].item_id;
        cur.group_id = cur_items[i].group_id;
        cur.layer = cur_items[i].layer;
        cur.name = cur_items[i].name;
        cur.type = cur_items[i].type;
        cur.pos_x = cur_items[i].pos_x;
        cur.pos_y = cur_items[i].pos_y;
        cur.rotate = cur_items[i].rotate;
        cur.width = cur_items[i].width;
        cur.length = cur_items[i].length;
        console.log(cur)
        plan.addItem(cur, true);
    }
    console.log(plan);
    return plan;
}
// get JSON from server

function getJSON(){
    // let str = new String();
    // get information from current url
    let location = window.location.href;
    // let's mock the location
    // let location = "/plan_models_json/2";
    console.log(location);
    let i = location.lastIndexOf("\/");
    location = location.substring(0, i);
    let j = location.lastIndexOf("\/");
    let id = location.substring(j + 1, i);
    console.log(typeof(id), id);
    // till now, we get the id number
    // then we should launch the get request
    let getRequest = new XMLHttpRequest();
    server_url = "/plan_models_json/" + id;
    getRequest.open("get", server_url);
    // console.log("url:" + server_url)
    getRequest.send(null)
    getRequest.onload = function (){
        // loaded = true;
        if(getRequest.status == 200){
            server_plan_obj = JSON.parse(getRequest.responseText);
            // str =  server_plan_obj.data.data;
            // console.log(getRequest.responseText);
            // console.log("target", server_plan_obj.data.data);
            // console.log(server_plan_obj);
            // make some initialization
            // let extra_json = server_plan_obj.data.extra1;
            // // let extra_obj = JSON.parse(extra_json);
            // console.log(extra_json)
            // return server_plan_obj.data.data;
            
            
            
            // deal with the extra values
            let extra_json = server_plan_obj.data.extra1;
            // console.log(extra_json);
            let extra_obj = JSON.parse(extra_json);
            // console.log(extra_obj);
            
            let dateRe = /^day.*date$/;
            let hourRe = /^day.*hour.*\d$/;
            let days = 0;
            for(let key in extra_obj){
                if(dateRe.test(key) && extra_obj[key] != ""){
                    days += 1;
                    let date = extra_obj[key].split("-");
                    // console.log(date);
                    let str_date = date[1] + "/" + date[2];
                    date_list.push(str_date);
                    // for every new day, generate two break slots
                    breakdown_time.push([0,0]);
                    breakdown_time.push([0,0]);
                    breakdown_time.push([0,0]);
                    breakdown_time.push([0,0]);
                    // console.log(breakdown_time);
                }else if(hourRe.test(key) && extra_obj[key] != ""){
                    // console.log("sappppppp")
                    let day = parseInt(key[3]);
                    let time_point = parseInt(key[9]);
                    if(time_point == 1){
                        breakdown_time[day*4 - 4][0] = 0 + 24*(day-1);
                        breakdown_time[day*4 - 4][1] = parseInt(extra_obj[key]) + 24*(day-1);
                    }
                    else if(time_point == 2){
                        breakdown_time[day*4 - 3][0] = parseInt(extra_obj[key]) + 24*(day-1);
                    }
                    else if(time_point == 3){
                        breakdown_time[day*4 - 3][1] = parseInt(extra_obj[key]) + 24*(day-1);
                    }
                    else if(time_point == 4){
                        breakdown_time[day*4 - 2][0] = parseInt(extra_obj[key]) + 24*(day-1);
                    }
                    else if(time_point == 5){
                        breakdown_time[day*4 - 2][1] = parseInt(extra_obj[key]) + 24*(day-1);
                    }
                    else if(time_point == 6){
                        breakdown_time[day*4 - 1][0] = parseInt(extra_obj[key]) + 24*(day-1);
                        breakdown_time[day*4 - 1][1] = 24*day;
                    }
                    // console.log(key, extra_obj[key], day, time_point);
                    // console.log(breakdown_time);
                }
                else if(key == "length"){
                    console.log("canvas length/height",extra_obj[key]);
                    document.getElementById("dest_copy").setAttribute("height", `${parseInt(extra_obj[key]*10)}px`);
                    canvasHeight  = canvas.height;
                    console.log(document.getElementById("dest_copy").height );
                }else if(key == "width"){
                    console.log("canvas width", extra_obj[key]);
                    document.getElementById("dest_copy").setAttribute("width", `${parseInt(extra_obj[key])*10}px`);
                    canvasWidth = canvas.width;
                }
                
            }
            // console.log(breakdown_time);
            // console.log(date_list, typeof(date_list), date_list[0]);
            // console.log(days);
            document.getElementById("timebar").setAttribute("max", 24*days);
            document.getElementById("timebar").value = breakdown_time[0][1];
            
            let plan_json = server_plan_obj.data.data;
            plan = decodeJSON(plan_json);
            plan.draw();
            plan.generateTable();
            selectTheTime();
        }else{
            console.log("JSON: errors occurred");
        }
    }
}
// var timeRe = /^\d{2}\/\d{2}\/\d+:\d{2}$/i;
// var relativeRe = /^t\d+\+\d+:\d{2}/i;

let canvasWidth = canvas.width;
let canvasHeight = canvas.height;


// when loading, get the JSON data and then draw the plan
// plan is a global variable
window.onload = function(){

    // let tmp = "{\"items\":{\"0\":{\"item_id\":0,\"layer\":\"furniture\",\"name\":\"couch\",\"setup_start\":\"04/28/13:00\",\"setup_duration\":\"1:00\",\"breakdown_start\":\"04/28/13:00\",\"breakdown_duration\":\"1:00\",\"owner\":\"chu\",\"type\":\"couch\",\"pos_x\":80,\"pos_y\":40,\"width\":40,\"length\":40},\"11\":{\"item_id\":11,\"layer\":\"top\",\"name\":\"triangle_room\",\"setup_start\":\"04/28/13:00\",\"setup_duration\":\"1:00\",\"breakdown_start\":\"04/28/13:00\",\"breakdown_duration\":\"1:00\",\"owner\":\"zhang\",\"type\":\"triangle_room\",\"pos_x\":400,\"pos_y\":300,\"width\":30,\"length\":40},\"14\":{\"item_id\":14,\"layer\":\"top\",\"name\":\"rect_room\",\"setup_start\":\"04/28/13:00\",\"setup_duration\":\"1:00\",\"breakdown_start\":\"04/28/13:00\",\"breakdown_duration\":\"1:00\",\"owner\":\"youli\",\"type\":\"round_room\",\"pos_x\":280,\"pos_y\":120,\"width\":150,\"length\":150}},\"creator\":\"zhang\", \"current_id\":\"16\"}";
    // firstly, try to get data (JSON) from local cache, if cannot find the required data, then get it from the server
    // console.log("loading");
    // console.log(JSON.parse(tmp));
    // call the interface from server
    getJSON();
    
    // setTimeout(function(){
    //     // console.log("not loaded");
    //     let plan_json = server_plan_obj.data.data;
    //     // console.log("plan_json", plan_json);
    //     plan = decodeJSON(plan_json);
        
    //     // console.log("pllannnnnn", plan);
    //     // let json_plan = JSON.stringify(plan_obj);
    //     // let out = new Plan();
    //     // out = JSON.parse(JSON.parse(json_plan));
    //     // console.log("cccccccccccc", json_plan);
    //     // console.log("bbbbbbbbbbbb", plan);
    //     plan.draw();
    //     plan.generateTable();
    //     selectTheTime();
    // }, 1000);
    
}
