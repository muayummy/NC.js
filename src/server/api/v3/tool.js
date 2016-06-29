"use strict";
var StepNC = require('../../../../../STEPNode/build/Release/StepNC');
var file = require('./file');
var find = file.find;
var _ = require('lodash');

var _getWorkstepsForTool = function(exe, toolId) {
    if (find.IsWorkingstep(exe)) {
        if (find.GetWorkingstepTool(exe) === toolId) {
            return [exe];
        }
        else {
            return [];
        }
    }
    else if (find.IsWorkplan(exe) || find.IsSelective(exe)) {
        let rtn = [];
        let children = find.GetNestedExecutableAll(exe);
        if (children !== undefined) {
            _.each(children, (childId) => {
                rtn = rtn.concat(_getWorkstepsForTool(childId, toolId));
            });
        }
        return rtn;
    }
    else {
        return [];
    }
};

var _getTools = function (req, res) {
  let toolList = find.GetToolAll();
  let rtn = [];
  for(let id of toolList){
      let name = find.GetToolPartName(id).replace(/_/g, ' ');
      let toolType = find.GetToolType(id);

      let workingsteps = _getWorkstepsForTool(find.GetMainWorkplan(), id);

      rtn.push({
        "id" : id,
        "name": name,
        "type": 'tool',
        'toolType': toolType,
        "workingsteps": workingsteps
      });
  }
  res.status(200).send(rtn);
};

var _getWsTool = function (req, res) {
  if (req.params.wsId) {
    let wsId = req.params.wsId;
    let rtn = find.GetWorkingstepTool(Number(wsId));
    res.status(200).send(String(rtn));
  }
};

module.exports = function(app, cb) {
  app.router.get("/v3/nc/tools", _getTools);
  app.router.get("/v3/nc/tools/:wsId", _getWsTool);
  if (cb) cb();
};