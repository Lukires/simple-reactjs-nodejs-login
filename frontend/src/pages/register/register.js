import React from 'react';
import { useHistory, Link } from "react-router-dom";
import { Button, Form } from 'react-bootstrap';
import "./register.css";
import api from '../../api/api';
class Register extends React.Component {

  constructor(props) {
    super(props);
    this.state = { password: "", email: "" };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = name => event => {
    this.setState({
      ...this.state,
      [name]: event.target.value,
    });
  };

  async handleSubmit(event) {
    event.preventDefault();

    const { email, password } = this.state;
    try {
      const data = await api.post("user/register/" + email + "/" + password);
      this.props.history.push("/");
    } catch (error) {
      alert(error.response.data);
    }
  }

  render() {
    return (
      <div>
        <h1 id="loginTitle">Register</h1>
        <div id="loginBox">
          <Form id="loginForm" onSubmit={(event) => this.handleSubmit(event)}>
            <Form.Group controlId="formEmail">
              <Form.Label>Email addresse</Form.Label>
              <Form.Control type="email" placeholder="Indtast email"
                value={this.state.email}
                onChange={this.handleChange('email')} />
            </Form.Group>
            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="Password" placeholder="Indtast password"
                value={this.state.password}
                onChange={this.handleChange('password')} />
            </Form.Group>
            <Button variant="primary" type="submit" style={{ marginRight: '2%', backgroundColor: '#4f92ff' }}>Register</Button>
          </Form>
        </div>
      </div>
    );
  }
}


export default Register;
