import React from 'react';
import api from '../../api/api';
import './dashboard.css';
import { Button } from 'react-bootstrap';

class Dashboard extends React.Component {

  constructor(props) {
    super(props);

    this.state = { loaded: false }
  }

  async componentWillMount() {
    const { data } = await api.get("user/");
    this.setState({ user: data, loaded: true });
    this.logout = this.logout.bind(this);

  }

  async logout() {
    try {
      const data = await api.post("user/logout").finally(function() {})
      this.props.history.push("/");
    } catch (error) {
      alert(error.response.data);
    }
  }

  render() {
    if (!this.state.loaded) {
      return (
        <div>
          <p>Loading...</p>
        </div>
      );
    }
    return (
      <div>
        <h1 id="dashboardTitle">Welcome back, {this.state.user.email}!</h1>
        <Button variant="primary" onClick={() => this.logout()} style={{ backgroundColor: '#4f92ff', marginRight: '45%', marginLeft: '45%', marginTop: "30px" }}>Logout</Button>
      </div>
    );
  }
}


export default Dashboard;
