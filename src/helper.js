export default class DistrictRepository {
  constructor(data) {
    this.data = this.normalizeData(data);
  }

  normalizeData(rawData) {
    return rawData.reduce((obj, location) => {
      const keys = Object.keys(location);
      const formattedKeys = this.getFormattedKeys(keys);
      const newObj = this.getLocationObject(keys, formattedKeys, location);
      const { timeFrame, data } = newObj;
      const locKey = location.Location;
      if (!obj[locKey]) {
        obj[locKey] = this.getObjectTemplate(locKey);
      }
      obj[locKey].info.push(newObj);
      obj[locKey].data[timeFrame] = this.getRoundedData(data, 1000);
      return obj;
    }, {});
  }

  getObjectTemplate(loc) {
    return {
        location: loc,
        data: {},
        info: [],
    }
  }

  getFormattedKeys(keys) {
    return keys.map(key => {
      const characterArray = [...key.replace(' ', '')];

      characterArray[0] = characterArray[0].toLowerCase();
      return characterArray.join('');
    })
  }

  getLocationObject(keys, formattedKeys, location) {
    return formattedKeys.reduce((obj, key, i) => {
      if (i !== 0) {
        obj[key] = location[keys[i]];
      }
      return obj;
    }, {});
  }

  compareDistrictAverages(first, second) {
    const returnObj = {}
    returnObj[first.toUpperCase()] = this.findAverage(first)
    returnObj[second.toUpperCase()] = this.findAverage(second)
    returnObj['compared'] = this.getRoundedData(returnObj[first.toUpperCase()] / returnObj[second.toUpperCase()], 1000)
    return returnObj
  }

  findAverage(district) {
    const data = this.findByName(district).data;
    const dataKeys = Object.keys(data);
    return this.getRoundedData((dataKeys.reduce((t, k) => t += data[k], 0) / dataKeys.length), 1000);
  }

  getRoundedData(data, accuracy = 1000) {
    if(isNaN(data)){
      return 0;
    }
    return Math.round(data * accuracy) / accuracy;
  }

  findByName(location) {
    if (!location){
      return undefined;
    }
    const originalKeys = Object.keys(this.data);
    const keys = originalKeys.map(key => key.toLowerCase());
    const index = keys.indexOf(location.toLowerCase());

    return this.data[originalKeys[index]];
  }

  findAllMatches(location) {
    const originalKeys = Object.keys(this.data);

    if (!location) {
      return originalKeys.map(e => this.findByName(e));
    }

    return originalKeys.filter(key => key.toLowerCase().includes(location.toLowerCase()))
                       .map(e => this.findByName(e));
  }
}
