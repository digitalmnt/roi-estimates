import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import "./index.css";
import App from "./App";

// This is the official Aave subgraph. You can replace it with your own, if you need to.
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/aave/protocol",
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App style={{ width: '100%' }}/>
  </ApolloProvider>,
  document.getElementById("root"),
);
