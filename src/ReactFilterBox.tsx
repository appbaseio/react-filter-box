import * as React from "react";
import * as _ from "lodash";
import FilterInput from "./FilterInput";
import SimpleResultProcessing from "./SimpleResultProcessing";

import GridDataAutoCompleteHandler, {
  Option
} from "./GridDataAutoCompleteHandler";
import Expression from "./Expression";
import FilterQueryParser from "./FilterQueryParser";
import BaseResultProcessing from "./BaseResultProcessing";
import BaseAutoCompleteHandler from "./BaseAutoCompleteHandler";
import ParsedError from "./ParsedError";

const operatorsMap = {
  exactlyMatches: "==",
  doesNotMatch: "!=",
  contains: "contains",
  doesNotContain: "doesnotcontains",
  startsWith: "startsWith",
  doesNotStartWith: "doesnotstartsWith",
  endsWith: "endsWith",
  doesNotEndWith: "doesnotendsWith",
  regularExpressionMatch: "matches"
};

function checkExpression(error: boolean, result: Expression[] | ParsedError) {
  function eachExpression(obj: Expression[] | ParsedError | any) {
    for (const k in obj) {
      if (typeof obj[k] == "object" && obj[k] !== null) eachExpression(obj[k]);
      else if (k === "operator") {
        if (!_.includes(_.keys(operatorsMap), obj[k])) {
          error = true;
          return;
        }
      }
    }
  }
  eachExpression(result);
  return error;
}

export default class ReactFilterBox extends React.Component<any, any> {
  public static defaultProps: any = {
    onParseOk: () => {},
    onParseError: () => {},
    onChange: () => {},
    onDataFiltered: () => {},
    autoCompleteHandler: null,
    onBlur: () => {},
    onFocus: () => {},
    editorConfig: {}
  };

  parser = new FilterQueryParser();

  constructor(props: any) {
    super(props);

    var autoCompleteHandler =
      this.props.autoCompleteHandler ||
      new GridDataAutoCompleteHandler(this.props.data, this.props.options);

    this.parser.setAutoCompleteHandler(autoCompleteHandler);

    this.state = {
      isFocus: false,
      isError: false
    };
    //need onParseOk, onParseError, onChange, options, data
  }

  needAutoCompleteValues(codeMirror: any, text: string) {
    return this.parser.getSuggestions(text);
  }

  onSubmit(query: string) {
    var result = this.parser.parse(query);
    let error = false;
    error = checkExpression(error, result);
    if ((result as ParsedError).isError || error) {
      return this.props.onParseError(result);
    }

    return this.props.onParseOk(result);
  }

  onChange(query: string) {
    const result = this.parser.parse(query);
    let error = false;
    error = checkExpression(error, result);
    if ((result as ParsedError).isError || error) {
      this.setState({ isError: true });
    } else {
      this.setState({ isError: false });
    }

    this.props.onChange(query, result);
  }

  onBlur() {
    this.setState({ isFocus: false });
  }

  onFocus() {
    this.setState({ isFocus: true });
  }

  render() {
    var className = "react-filter-box";
    if (this.state.isFocus) {
      className += " focus";
    }
    if (this.state.isError) {
      className += " error";
    }

    return (
      <div className={className}>
        <FilterInput
          autoCompletePick={this.props.autoCompletePick}
          customRenderCompletionItem={this.props.customRenderCompletionItem}
          onBlur={this.onBlur.bind(this)}
          onFocus={this.onFocus.bind(this)}
          value={this.props.query}
          needAutoCompleteValues={this.needAutoCompleteValues.bind(this)}
          onSubmit={this.onSubmit.bind(this)}
          onChange={this.onChange.bind(this)}
          editorConfig={this.props.editorConfig}
        />
      </div>
    );
  }
}

export {
  SimpleResultProcessing,
  BaseResultProcessing,
  GridDataAutoCompleteHandler,
  BaseAutoCompleteHandler,
  Option as AutoCompleteOption,
  Expression
};
