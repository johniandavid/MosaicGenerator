import React from 'react'
import Authentication from '../../util/Authentication/Authentication'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Container'
import Button from "react-bootstrap/Button";

export default class App extends React.Component{
    constructor(props){
        super(props)
        this.Authentication = new Authentication()
        this.twitch = window.Twitch ? window.Twitch.ext : null
        this.state={
            finishedLoading:false,
            theme:'dark',
            isVisible: true
        }
    }

    contextUpdate(context, delta){
        if(delta.includes('theme')){
            this.setState(()=>{
                return {theme:context.theme}
            })
        }
    }

    componentDidMount(){
        if(this.twitch){
            this.twitch.onAuthorized((auth)=>{
                this.Authentication.setToken(auth.token, auth.userId)
                if(!this.state.finishedLoading){
                    this.setState(()=>{
                        return {finishedLoading:true}
                    })
                }
            })

            this.twitch.onContext((context,delta)=>{
                this.contextUpdate(context,delta)
            })
        }
    }

    render() {
        if(this.state.finishedLoading){
            return (
                <div>
                    <Container className="App">
                        <Row>
                            <a href="https://gamechangercharity.org/" target="_blank"><div className="zoom"></div></a>

                        </Row>
                    </Container>
                    <Container className="footer">

                    </Container>
                </div>
            )
        }else{
            return (
                <div className="App">
                </div>
            )
        }
    }
}