sap.ui.define([
  'sap/ui/core/SeparatorItem',
  "com/lonwyr/MyranorBot/controller/BaseController"
], function(
  SeparatorItem,
  Controller
) {
  "use strict";

  const weightCategories = [0.01, 0.025, 1, 5, 25, 125, 1000, 10000];

  function round(value) {
    return Math.round(value * 100) / 100;
  }
  
  function calculateWeightCost(totalCosts, category, structure, materials, material, quality, golemSizes, golemSize, chimeraWeight, corpseWeight) {
    const weight = calculateWeight(totalCosts, golemSizes, category, materials, material, quality, golemSize, chimeraWeight, corpseWeight);
    const power = weightCategories.findIndex(w => w > weight) - 2;
    const weightCost = structure.costs.weight * (2 ** power);
    console.log(`category: ${category}\ntotalCosts: ${totalCosts}\nweight: ${weight}\npower: ${power}\nweightCost: ${weightCost}`);

    return weightCost;
  }

  function calculateWeight(totalCosts, golemSizes, category, materials, material, quality, golemSize, chimeraWeight, corpseWeight) {
    let weight = 0;
    const materialData = materials.find(m => m.category === material);

    switch (category) {
      case "Nekromantie":
        const qualityData = materialData.qualities.find(q => q.name === quality) || {necromancyWeightMod: 0};
        weight = qualityData.necromancyWeightMod * corpseWeight;
        // todo calc by quality
        break;
      case "Golembau":
        weight = golemSizes.find(s => s.id === parseInt(golemSize)).weight * materialData.golemWeightMod;
        break;
      case "Chimärenerschaffung":
        weight = chimeraWeight;
        break;
      default:
        weight = totalCosts / 25 * materialData.weight;
    }
    
    return weight;
  }

  function calculateTotalCosts(structure, duration, volume) {
    if ([structure, duration].some(i => i === undefined)) {
      return 0;
    }

    let totalCosts = 0;

    const costsData = structure.costs;
    totalCosts += costsData.base;
    totalCosts += costsData.time * 2 ** (parseInt(duration) - 5);
    // TODO: weight
    if (costsData.volume) {
      totalCosts += volume * costsData.volume;
    }

    return totalCosts;
  }


  return Controller.extend("com.lonwyr.MyranorBot.controller.Influxion", {
    onBeforeRendering: function () {
      const influxion = "Beschwörungsmatrix";

      this._influxionModel = this.getModel("influxion");

      this._influxionModel.setData({
        category: influxion,
        quality: 1,
        duration: "5",
        golemSize: 1,
        chimeraWeight: 125,
        corpseWeight: 0,
        volume: 0,
        aspModificators: [
          {
            name: "Permanenzzauberer",
            valueText: "halbiert pAsP",
            pAsPFactor: -0.5,
            selected: false
          },
          {
            name: "Verdoppelung (Eskates, Iryabaar, Kraft, Zauberei und Zeit)",
            valueText: "AsP x2",
            factor: 1,
            selected: false
          },
          {
            name: "Kraftontrolle",
            valueText: "-1 AsP",
            value: -1,
            selected: false
          },
          {
            name: "Kraftfokus",
            valueText: "-1 AsP",
            value: -1,
            selected: false
          },
          {
            name: "Aurakonjunktion III",
            valueText: "-10% AsP",
            factor: -0.1,
            selected: false
          },
          {
            name: "Magischer Experte",
            valueText: "-10% AsP",
            factor: -0.1,
            selected: false
          },
          {
            name: "Spezialwissen",
            valueText: "-10% AsP",
            factor: -0.1,
            selected: false
          },
          {
            name: "Kostenersparnis (3 ZfP*)",
            valueText: "-10% AsP",
            factor: -0.1,
            selected: false,
            group: "ZfP*"
          },
          {
            name: "Kostenersparnis (6 ZfP*)",
            valueText: "-20% AsP",
            factor: -0.2,
            selected: false,
            group: "ZfP*"
          },
          {
            name: "Kostenersparnis (9 ZfP*)",
            valueText: "-30% AsP",
            factor: -0.3,
            selected: false,
            group: "ZfP*"
          },
          {
            name: "Kostenersparnis (12 ZfP*)",
            valueText: "-40% AsP",
            factor: -0.4,
            selected: false,
            group: "ZfP*"
          },
          {
            name: "Kostenersparnis (15 ZfP*)",
            valueText: "-50% AsP",
            factor: -0.5,
            selected: false,
            group: "ZfP*"
          }
        ]
      });

      sap.x = this._influxionModel;

      this.setInfluxion(influxion);
      this.changeMaterialSelections();
      const maxDurationSelection = this.byId("maxDurationSelection");
    },

    getGroupHeader: function (group) {
      return new SeparatorItem( {
				text: group.key
			});
    },

    getInfluxionData: function (influxion) {
      var instructions = this.getModel("magic").getProperty("/instructions");
      return instructions["Influxion (" + influxion + ")"];
    },

    onSetStructure: function (event) {
      const path = event.getParameter("selectedItem").getBinding("key").getContext().getPath();
      const structure = event.getParameter("selectedItem").getBinding("key").getModel().getProperty(path);
      this._influxionModel.setProperty("/structure", structure);
    },

    onInfluxionSelected: function (event) {
      const newInfluxion = event.getSource().getBinding("selectedKey").getValue();
      this.setInfluxion(newInfluxion);
    },

    setInfluxion: function (influxion) {
      this.changeMaterialSelections();
      const structures = this.getInfluxionData(influxion).structures;
      this._influxionModel.setProperty("/structures", structures);
      this._influxionModel.setProperty("/structure", structures[0]);
      const strucureSelectionList = this.byId("structureSelection");
      if (strucureSelectionList) {
        strucureSelectionList.setSelectedItem(strucureSelectionList.getItems()[0]);
      }
    },
    
    changeMaterialSelections: function () {
      const category = this._influxionModel.getProperty("/category");
      const materials = this.getModel("magic").getProperty("/materials").filter(m => m.influxions.indexOf(category) !== -1);
      this._influxionModel.setProperty("/materials", materials);
      this._influxionModel.setProperty("/material", materials[0].category);
      this._influxionModel.setProperty("/qualities", materials[0].qualities);
      this._influxionModel.setProperty("/quality", materials[0].qualities[0].name);
    },

    formatWeight: function(golemSizes, category, structure, duration, materials, material, quality, volume, golemSize, chimeraWeight, corpseWeight) {
      if ([golemSizes, category, structure, duration, materials, material, quality, golemSize, chimeraWeight, corpseWeight].some(i => i === undefined)) {
        return;
      }
      const weight = this.calculateWeight(golemSizes, category, structure, duration, materials, material, quality, volume, golemSize, chimeraWeight, corpseWeight);
      return round(weight);
    },

    formatMaterialUnits: function(golemSizes, category, structure, duration, materials, material, quality, volume, golemSize, chimeraWeight, corpseWeight) {
      if ([golemSizes, category, structure, duration, materials, material, quality, golemSize, chimeraWeight, corpseWeight].some(i => i === undefined)) {
        return;
      }
      const weight = this.calculateWeight(golemSizes, category, structure, duration, materials, material, quality, volume, golemSize, chimeraWeight, corpseWeight);
      const materialData = materials.find(m => m.category === material);
      return round(weight/materialData.weight);
    },

    formatMaterialCosts: function(golemSizes, category, structure, duration, materials, material, quality, volume, golemSize, chimeraWeight, corpseWeight) {
      if ([golemSizes, category, structure, duration, materials, material, quality, golemSize, chimeraWeight, corpseWeight].some(i => i === undefined)) {
        return;
      }
      const weight = this.calculateWeight(golemSizes, category, structure, duration, materials, material, quality, volume, golemSize, chimeraWeight, corpseWeight);
      const materialData = materials.find(m => m.category === material);
      const units = round(weight/materialData.weight);
      const qualityLevel = 1 + materialData.qualities.findIndex(i => i.name === quality);
      const costs = materialData.priceFactor ? units * (qualityLevel ** materialData.priceFactor) : units * qualityLevel;
      return costs;
    },

    calculateWeight: function(golemSizes, category, structure, duration, materials, material, quality, volume, golemSize, chimeraWeight, corpseWeight) {
      if ([golemSizes, category, structure, duration, materials, material, quality, golemSize, chimeraWeight, corpseWeight].some(i => i === undefined)) {
        return;
      }

      let weight = 0;
      const materialData = materials.find(m => m.category === material);
  
      switch (category) {
        case "Nekromantie":
          const qualityData = materialData.qualities.find(q => q.name === quality) || {necromancyWeightMod: 0};
          weight = qualityData.necromancyWeightMod * corpseWeight;
          // todo calc by quality
          break;
        case "Golembau":
          weight = golemSizes.find(s => s.id === parseInt(golemSize)).weight * materialData.golemWeightMod;
          break;
        case "Chimärenerschaffung":
          weight = chimeraWeight;
          break;
        default:
          const totalCosts = calculateTotalCosts(structure, duration, volume);
          weight = totalCosts / 25 * materialData.weight;
      }

      return weight;
    },

    onMaterialSelected: function (event) {
      const materialName = event.getParameter("selectedItem").getKey();
      const material = this.getModel("magic").getProperty("/materials").find(m => m.category === materialName);
      this._influxionModel.setProperty("/qualities", material.qualities);
      this._influxionModel.setProperty("/quality", material.qualities[0].name);
    },

    onQualitySelected: function (event) {
      debugger;
    },

    onAspModificatorsChange: function (event) {
      const selected = event.getParameter("selected");
      const changedItem = event.getParameter("changedItem");
      const key = changedItem.getKey();
      const model = changedItem.getBinding("key").getModel();
      const modificators = model.getProperty("/aspModificators");
      const selectedModificator = modificators.find(m => m.name === key);
      selectedModificator.selected = selected;
      const selectedModificatorsGroup = selectedModificator.group;
      const selectedItems = this.byId("savingsBox").getSelectedItems();
      if (selectedModificatorsGroup && selected) {
        modificators.forEach(m => {
          if (m.group === selectedModificatorsGroup && m.name !== key && m.selected) {
            m.selected = false;
            const correspondingItem = selectedItems.find(i => i.getKey() === key);
            event.getSource().removeSelectedItem(correspondingItem);
            debugger;
          }
        });
      }
      model.updateBindings(true);
    },

    formatAsp: function (golemSizes, category, structure, duration, materials, material, quality, volume, golemSize, chimeraWeight, corpseWeight, aspModificators) {  
      if ([golemSizes, category, structure, duration, materials, material, quality, golemSize, chimeraWeight, corpseWeight].some(i => i === undefined)) {
        return;
      }

      let totalCosts = calculateTotalCosts(structure, duration, volume);
      totalCosts += calculateWeightCost(totalCosts, category, structure, materials, material, quality, golemSizes, golemSize, chimeraWeight, corpseWeight);

      const modificators = aspModificators.filter(m => m.selected);
      const relativeModificators = modificators.filter(m => m.factor !== undefined) || [];
      const relativeModificator = relativeModificators.map(m => m.factor).reduce((a,b) => a + b, 1);
      const absoluteModificators = modificators.filter(m => m.value !== undefined) || [];
      const absoluteModificator = absoluteModificators.map(m => m.value).reduce((a,b) => a + b, 0);
      const relativePAspModificators = modificators.filter(m => m.pAsPFactor !== undefined) || [];
      let relativePAspModificator = relativePAspModificators.map(m => m.pAsPFactor).reduce((a,b) => a + b, 1);
      const efficient = materials.find(m => m.category === material).properties.some(m => m === "Effizient");
      if (efficient) {
        const materialData = materials.find(m => m.category === material);
        const qualityLevel = 1 + materialData.qualities.findIndex(i => i.name === quality);
        relativePAspModificator += -0.1 * qualityLevel;
      }

      totalCosts = totalCosts * relativeModificator + absoluteModificator;
      totalCosts = Math.max(Math.round(totalCosts), 1);
      let pAsp = duration === "10" ? Math.max(Math.round(totalCosts * relativePAspModificator / 10),1) : 0;

      if (pAsp) {
        totalCosts = `${totalCosts} (${pAsp})`;
      }

      return totalCosts;
    }
  });
});
