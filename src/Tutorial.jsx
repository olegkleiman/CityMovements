import React, { useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';

const styles = theme => ({
  root: {
    width: '90%',
  },
  button: {
    marginRight: theme.spacing.unit,
  },
  nav: {
    float: 'right'
  },
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 70,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    outline: 'none',

    top: '50%',
    left: '50%',
    width: '800px',
    overflow: 'hidden',
    transform: 'translate(-50%, -50%)'
  },
  footer: {
    borderTop: '1px solid #ccc',
    backgroundColor: '#F8F8F9',
    padding: '20px 40px'
  }
});

function getSteps() {
  return ['Understanding Origin', 'Understanding Destination And Colors', 'Understanding Comparison'];
}

function getStepContent(stepIndex) {
  switch (stepIndex) {
    case 0:
      return <video width="800" src="https://s3-us-west-2.amazonaws.com/uber-common-public/movement/videos/TutorialMotion1.mp4" autoPlay=""></video>
    case 1:
      return <video width="800" src="https://s3-us-west-2.amazonaws.com/uber-common-public/movement/videos/TutorialMotion2.mp4" autoplay=""></video>;
    case 2:
      return <video width="800" src="https://s3-us-west-2.amazonaws.com/uber-common-public/movement/videos/TutorialMotion3.mp4" autoplay=""></video>;
    default:
      return 'Unknown stepIndex';
  }
}

const Tutorial = (props) => {

    const [activeStep, setActiveStep] = useState(0);
    const [open, setOpen] = useState(true);
    const steps = getSteps();
    const totalSteps = () => getSteps().length;

    const { classes } = props;
    const onCloseCallback = props.onClose;

    useEffect( () => {
        setOpen(props.show)
    },[props.show]);

    const onClose = () => {
      setOpen(false);
      if( onCloseCallback )
        onCloseCallback()
    }

    const isLastStep = () => {
      return activeStep === totalSteps() - 1;
    }

    const handleNext = () => {
      if ( isLastStep() ) {
        onClose();
      } else {
        setActiveStep(activeStep+1);
      }
    }

    const handleBack = () => {
       setActiveStep(activeStep-1);
    };

    return (
      <Modal open={open}>
          <div className={classes.paper}>
            <Stepper activeStep={activeStep} alternativeLabel>
            {
              steps.map( (label, index) => {

                const props = {};
                const labelProps = {};

                return (
                  <Step key={label} {...props}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                )
              })
            }
            </Stepper>
            <div>
              { getStepContent(activeStep) }
            </div>
            <div className={classes.footer}>
              <Button variant="contained"
                    onClick={onClose}
                    className={classes.button}>
                    Skip
              </Button>
              <span className={classes.nav}>
                <Button disabled={activeStep === 0}
                      onClick={handleBack}
                      className={classes.backButton}>
                      Back
                </Button>
                <Button variant="contained" color="primary" onClick={handleNext}>
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </span>
            </div>
          </div>
      </Modal>)
};

export default withStyles(styles)(Tutorial);
