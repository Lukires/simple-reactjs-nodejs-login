import React from 'react';
import { Route, Link, BrowserRouter as Router, Redirect, BrowserRouter, Switch } from 'react-router-dom'
import Dashbord from './pages/dashboard/dashboard';
import Login from './pages/login/login';
import Register from './pages/register/register';
import api from './api/api';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { authed: false, loaded: false };
  }

  //SEO - Pre rendering
  //Robotos.txt - fetch as google

  async componentWillMount() {

    const { data } = await api.get("user/validsession");
    this.setState({ authed: data, loaded: true });
    console.log(data);
  }


  render() {
    if (!this.state.loaded) {
      return (
        <div>
          <p>Loading...</p>
        </div>
      );
    }

    //forceRefresh because it's quick and easy
    //helps for authentication
    return (
      <div>
        <BrowserRouter forceRefresh={true}>
          <Switch>
            <Route path="/login" component={Login} exact />
            <Route path="/register" component={Register} exact/>
            <PrivateRoute authed={this.state.authed} path="/" component={Dashbord} exact/>
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}



const PrivateRoute = ({component: Component, ...rest}) => {
  return (
      <Route {...rest} render={props => (
          rest.authed ?
              <Component {...props} />
          : <Redirect to="/login" />
      )} />
  );
};


export default App;
