import { default as React, Component } from "react";
import { ItemCheckboxList } from "./ItemCheckboxList.js";
import { AppbaseSensorHelper } from "@appbaseio/reactivebase";

export class SearchAsMove extends Component {
	constructor(props, context) {
		super(props);
		this.state = {
			items: []
		};
		this.handleSelect = this.handleSelect.bind(this);
		this.handleRemove = this.handleRemove.bind(this);
	}

	componentDidMount() {
		this.setState({
			items: [{
				key: "Search as I move the map",
				value: true,
				status: this.props.searchAsMoveDefault
			}]
		});
		if (this.props.searchAsMoveDefault && this.props.searchAsMoveDefault === true) {
			this.handleSelect(this.props.searchAsMoveDefault);
		}
	}

	// Handler function when a value is selected
	handleSelect(value) {
		const flag = value === true ? true : (!!(value && value.length));
		this.props.searchAsMoveChange(flag);
	}

	// Handler function when a value is deselected or removed
	handleRemove(value) {
	}

	render() {
		let listComponent;
		listComponent = (<ItemCheckboxList
			showTags={false}
			items={this.state.items}
			onSelect={this.handleSelect}
			onRemove={this.handleRemove}
			showCount={this.props.showCount}
		/>);

		return (
			<div className="rbc-checkbox row clearfix">
				{listComponent}
			</div>
		);
	}

}

SearchAsMove.propTypes = {};

// Default props value
SearchAsMove.defaultProps = {
	fieldName: "SearchAsMove",
	searchAsMoveDefault: false
};
