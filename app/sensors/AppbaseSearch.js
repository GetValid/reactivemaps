import { default as React, Component } from 'react';
import { render } from 'react-dom';
import {queryObject} from '../middleware/ImmutableQuery.js';
import Select from 'react-select';
import {manager} from '../middleware/ChannelManager.js';
var helper = require('../middleware/helper.js');

export class AppbaseSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      currentValue: {}
    };
    this.type = 'Match';
    this.handleSearch = this.handleSearch.bind(this);
    this.setValue = this.setValue.bind(this);
    this.previousSelectedSensor = {};
  }
  // Get the items from Appbase when component is mounted
  componentDidMount() {
    this.setQueryInfo();
    this.createChannel();
  }
  // set the query type and input data
  setQueryInfo() {
    let obj = {
        key: this.props.sensorId,
        value: {
          queryType: this.type,
          inputData: this.props.inputData
        }
    };
    helper.selectedSensor.setSensorInfo(obj);
    let searchObj = {
        key: 'searchLetter',
        value: {
          queryType: 'multi_match',
          inputData: this.props.inputData
        }
    };
    helper.selectedSensor.setSensorInfo(searchObj);
  }
  // Create a channel which passes the depends and receive results whenever depends changes
  createChannel() {
    let depends = this.props.depends ? this.props.depends : {};
    depends['searchLetter'] = "must";
    var channelObj = manager.create(depends);
    channelObj.emitter.addListener(channelObj.channelId, function(data) {
      this.setData(data);
    }.bind(this));
  }
   // set value to search
  setValue(value, callback) {
    var obj = {
        key: 'searchLetter',
        value: value
    };
    helper.selectedSensor.set(obj, true);
    this.callback = callback;
  }

  // set data after get the result
  setData(data) {
    let options = [];
    let searchField = `hit._source.${this.props.inputData}`;
    // Check if this is Geo search or field tag search
    if (this.props.isGeoSearch) {
      // If it is Geo, we return the location field
      let latField = `hit._source.${this.props.latField}`;
      let lonField = `hit._source.${this.props.lonField}`;
      data.hits.hits.map(function (hit) {
        let location = {
          lat: eval(latField),
          lon: eval(lonField)
        };
        options.push({ value: location, label: eval(searchField) });
      });
    } else {
      data.hits.hits.map(function (hit) {
        options.push({ value: eval(searchField), label: eval(searchField) });
      });
    }
    options = this.removeDuplicates(options, "label");
    if(this.callback) {
      this.callback(null, {
        options: options
      });
    }
  }
  // Search results often contain duplicate results, so display only unique values
  removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }
  // When user has selected a search value
  handleSearch(currentValue) {
    let value = currentValue ? currentValue.value : null;
    value = value === 'null' ? null : value;
    var obj = {
        key: this.props.sensorId,
        value: value
    };
    helper.selectedSensor.set(obj, true);
    this.setState({
      currentValue: value
    });
  }
  render() {
    return (
      <Select.Async
        className="appbase-select"
        name="appbase-search"
        value={this.state.currentValue}
        loadOptions={this.setValue}
        onChange={this.handleSearch}
        {...this.props}
        />
    );
  }
}
AppbaseSearch.propTypes = {
  inputData: React.PropTypes.string.isRequired,
  placeholder: React.PropTypes.string,
  isGeoSearch: React.PropTypes.bool,
  size: React.PropTypes.number,
};
// Default props value
AppbaseSearch.defaultProps = {
  placeholder: "Search...",
  isGeoSearch: false,
  size: 10,
};