import React from 'react'
import Authentication from '../../util/Authentication/Authentication'
import './LiveConfigPage.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Button from 'react-bootstrap/Button'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import InputGroup from 'react-bootstrap/InputGroup'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
//import {Donation} from "../../data/Donation";
//import {Donations} from "../../util/Donations/Donations";
export default class LiveConfigPage extends React.Component{
    constructor(props){
        super(props)
        this.Authentication = new Authentication()
        this.minCreatedAt = ""
        this.maxCreatedAt = ""
        //this.timer = null
        this.twitch = window.Twitch ? window.Twitch.ext : null
        this.state={
            finishedLoading:false,
            theme:'dark',
            isVisible: true,
            fileName: "Choose File",
            filePath: "",
            goal: 0,
            fileDisabled: false,
            rangeDisabled: false,
            buttonDisabled: false,
            resetButtonDisabled: false,
            buttonVariant:"primary",
            buttonText:"Start",
            url:""
        }
        this.handleSlider = this.handleSlider.bind(this);
        this.buttonHandler = this.buttonHandler.bind(this);
        this.startButtonHandler = this.startButtonHandler.bind(this);
        this.handleFileInput = this.handleFileInput.bind(this);
        this.stopButtonHandler = this.stopButtonHandler.bind(this);
        this.sleep = this.sleep.bind(this);
        this.revealButtonHandler = this.revealButtonHandler.bind(this);
        this.resetButtonHandler = this.resetButtonHandler.bind(this);
        this.resetButtonHandler = this.resetButtonHandler.bind(this);
        //this.parseDonations = this.parseDonations.bind(this);
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

    handleSlider(e){
        this.setState({
            goal: e.target.value
        })
    }

    buttonHandler(e){
        if(this.state.buttonText === "Start") {
            this.startButtonHandler(e)
        }
        else if(this.state.buttonText == "Stop"){
            this.stopButtonHandler(e)
        }
        else if(this.state.buttonText == "Reveal")
        {
            this.revealButtonHandler(e)
        }
    }
    handleFileInput(e){
        this.setState({
            filePath: e.target.value,
            fileName: e.target.value.split('\\').pop()
        })
    }

    startButtonHandler(e){
        console.log("Started Accepting Donations")
        this.minCreatedAt = Date.now().toString();
        //this.timer = setInterval(()=> this.getDonations().then(this.parseDonations), 5000);
        this.setState({
            fileDisabled: true,
            rangeDisabled: true,
            buttonVariant:"danger",
            buttonText:"Stop"
        })
    }

    stopButtonHandler(e){
        //clearInterval(this.timer)
        //this.timer = null
        this.maxCreatedAt = Date.now().toString()
        const URL = "https://d7b4dsgwd4.execute-api.us-east-1.amazonaws.com/dev-4/report?donationLimit=10&campaignLimit=0" //+ "&minCreatedAt=" + this.minCreatedAt + "&maxCreatedAt=" + this.maxCreatedAt

        console.log(URL)
        console.log("Stopped Accepting Donations")
        console.log("Mosaic is being rendered")
        this.setState({
            buttonDisabled: true,
            resetButtonDisabled: true,
            buttonText: "Mosaic Rendering..."
        })

        fetch("http://localhost:1234")

        this.sleep(180000)
            .then(() => {
                this.setState({
                    buttonDisabled: false,
                    resetButtonDisabled: false,
                    buttonVariant:"success",
                    buttonText:"Reveal"
                })
                console.log("Mosaic is finished. Ready to reveal");
            });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    revealButtonHandler(e){
        console.log("Mosaic Revealed")
        window.open("http://localhost:1234/output/output_1575323560260.jpg",'Mosaic');
        this.setState({
            buttonDisabled: true
        })
    }

    resetButtonHandler(e){
        //this.timer = null
        this.setState({
            fileDisabled: false,
            rangeDisabled: false,
            buttonDisabled: false,
            filePath: "",
            fileName: "Choose File",
            buttonVariant:"primary",
            buttonText:"Start"
        })
        console.log("Buttons Reset")
    }

    /*  getDonations() {
          const URL = "https://d7b4dsgwd4.execute-api.us-east-1.amazonaws.com/dev-4/report?donationLimit=1000000&campaignLimit=0" + "&minCreatedAt=" + "1573253598862"
          return new Promise(function (resolve, reject) {
              fetch(URL)
                  .then(response => response.json())
                  .then(body => {
                      resolve([body]);
                  });
          });
      }*/

    render() {
        if(this.state.finishedLoading && this.Authentication.isModerator()){
            return (
                <div className="LiveConfig">
                    <div>
                        <Container className="main">
                            <Row className= "File-Input">
                                <Col>
                                    <InputGroup>
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">Upload</span>
                                        </div>
                                        <div className="custom-file">
                                            <input type="file" className="custom-file-input" disabled={this.state.fileDisabled} accept="image/*" onChange={this.handleFileInput}/>
                                            <label className="custom-file-label">{this.state.fileName}</label>
                                        </div>
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row className="Goal-Slider">
                                <Col className="Goal-Badge">
                                    <h5> Goal: <Badge className="Goal-Badge" size="lg" pill variant="success">${this.state.goal}</Badge></h5>
                                </Col>
                                <Col>
                                    <input type="range" className="custom-range" min="0" max="10000" disabled={this.state.rangeDisabled} value={this.state.goal} onChange={this.handleSlider}/>
                                </Col>
                            </Row>
                            <Row className="Buttons">
                                <ButtonToolbar className="mt-3" vertical="true">
                                    <Button variant={this.state.buttonVariant} disabled={this.state.buttonDisabled} size="lg" onClick={this.buttonHandler}> {this.state.buttonText} </Button>
                                    <Button variant="secondary" size="lg" disabled={this.state.resetButtonDisabled} onClick={this.resetButtonHandler}> Reset </Button>
                                </ButtonToolbar>
                            </Row>
                        </Container>
                    </div>
                </div>
            )
        }else{
            return (
                <div className="LiveConfig">
                </div>
            )
        }
    }
}