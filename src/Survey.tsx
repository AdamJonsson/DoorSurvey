import React, { useEffect, useRef, useState } from "react";
import "./App.scss";
import * as SurveyService from "./services/SurveyService";
import Question from "./components/question/question";
import {
  Button,
  Card,
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
} from "@material-ui/core";
import { isMobile } from "react-device-detect";
import { Door } from "./models/Door";
import { DoorForm, SurveyForm } from "./models/SurveyForm";
import useWindowDimensions from "./hooks/useWindowDimensions";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

function Survey() {
  const [doors, setDoors] = useState<Door[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [doorAnswers, setDoorAnswers] = useState<any>({});

  const [age, setAge] = useState("");
  const [soundFamiliarity, setSoundFamiliarity] = useState(0);
  const [gender, setGender] = useState("");
  const [customGender, setCustomGender] = useState("");
  const [hearingProblems, setHearingProblems] = useState("");
  const [comment, setComment] = useState("");
  const [influence, setInfluence] = useState("");

  const windowDimensions = useWindowDimensions();
  const [onMobile, setOnMobile] = useState(false);

  const [sent, setSent] = useState(false);

  const loudAudioPlayer = useRef<HTMLAudioElement>(null);
  const weakAudioPlayer = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setOnMobile(windowDimensions.width < 700);
  }, [windowDimensions.width]);

  useEffect(() => {
    setDoors(SurveyService.getDoorDataInRandomOrder());
  }, []);

  const checkAnswered = (id: number) => {
    return doorAnswers[id]
      ? doorAnswers[id].emotion && doorAnswers[id].confidence
      : false;
  };

  const sendSurvey = () => {
    if (document) {
      if (gender === "" || age === "" || soundFamiliarity === 0) {
        document
          .getElementById(`intro`)!
          .scrollIntoView({ behavior: "smooth" });
        setShowErrors(true);
      } else {
        const unanswered = doors.find((door) => !checkAnswered(door.id));
        if (unanswered) {
          document
            .getElementById(`door_${unanswered.id}`)!
            .scrollIntoView({ behavior: "smooth" });
          setShowErrors(true);
        } else {
          const answers = Object.keys(doorAnswers)
            .map((k) => {
              return {
                ...doorAnswers[k],
                door: doors.find((door) => door.id === parseInt(k)),
              };
            })
            .map(({ door, emotion, confidence }) => {
              return new DoorForm(door, emotion, confidence);
            });
          const form = new SurveyForm(
            age,
            soundFamiliarity,
            checkCustomGender() ? customGender : gender,
            hearingProblems,
            answers,
            comment,
            influence,
            isMobile
          );
          SurveyService.uploadSurveyToFirestore(form).then(() => setSent(true));
        }
      }
    }
  };

  const checkCustomGender = () => {
    return gender === "not-listed";
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="main">
          {sent ? (
            <Card>
              <div className="content-padding">
                <h1>Thank you for your answer!</h1>
              </div>
            </Card>
          ) : (
            <>
              <Card>
                <div className="content-padding" id="intro">
                  <h1>Evaluation of Knocking Sounds</h1>
                  <div>
                    If possible, please use a desktop or laptop computer to fill
                    in this form.
                    <br />
                    Use headphones and try to limit other distractions and noise
                    in your environment. <br />
                    <br />
                    Set you computer volume so that you can listen
                    to the loud sound comfortably while also hearing 
                    the quiet audio. Play the loud and quiet sounds by 
                    pressing the buttons below.
                    <br/><br/>
                    <div>
                      <Button
                          onClick={() => {
                              loudAudioPlayer.current?.play();
                          }}
                          variant="contained"
                          color="primary"
                          size="large"
                          style={{
                            marginRight: "15px"
                          }}
                          startIcon={<PlayArrowIcon />}
                      >
                          Play loud audio
                      </Button>
                      <audio ref={loudAudioPlayer} controls={false}>
                        <source src={`/sounds/fear_42.wav`}/>
                        Your browser does not support the audio tag.
                      </audio>
                      
                      <Button
                          onClick={() => {
                              weakAudioPlayer.current?.play();
                          }}
                          variant="contained"
                          color="primary"
                          size="large"
                          startIcon={<PlayArrowIcon />}
                      >
                          Play quiet audio
                      </Button>
                      <audio ref={weakAudioPlayer} controls={false}>
                        <source src={`/sounds/sadness_1.wav`}/>
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                    <br />
                    <br />
                    Play and <b>watch</b> the video shown before answering. You can
                    play it as many times as you want by clicking the play-button again. 
                    There is no right or wrong answer.
                  </div>
                  <TextField
                    label="How old are you?"
                    required
                    id="standard-basic"
                    error={showErrors && age === ""}
                    onBlur={(e) => setAge(e.target.value)}
                  />
                  <br />
                  <FormControl className="form-control">
                    <InputLabel required id="demo-simple-select-label">
                      Gender
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      onChange={(e) => setGender(e.target.value as string)}
                      value={gender}
                      error={showErrors && gender === ""}
                    >
                      <MenuItem value={"male"}>Male</MenuItem>
                      <MenuItem value={"female"}>Female</MenuItem>
                      <MenuItem value={"non-binary"}>Non-binary</MenuItem>
                      <MenuItem value={"not-listed"}>Not listed</MenuItem>
                      <MenuItem value={"no-disclosure"}>
                        Don't want to disclose
                      </MenuItem>
                    </Select>
                    {checkCustomGender() && (
                      <TextField
                        label="Specify your gender"
                        required
                        id="standard-basic"
                        error={
                          showErrors &&
                          checkCustomGender() &&
                          customGender === ""
                        }
                        onBlur={(e) => setCustomGender(e.target.value)}
                      />
                    )}
                  </FormControl>
                  <br/>
                  <br/>
                  Do you have any hearing problems that you are aware of?
                  <div style={{ display: "flex" }}>
                  <TextField
                      id="outlined-multiline-static"
                      multiline
                      rows={4}
                      placeholder="Write if you have hearing problems"
                      variant="outlined"
                      onBlur={(e) => setHearingProblems(e.target.value)}
                    />
                    </div>
                  <p
                    className={
                      showErrors && soundFamiliarity === 0 ? "error-text" : ""
                    }
                  >
                    How would you rate your experience with sound? *
                  </p>
                  <div className="marks">
                    <div className="marks-details">
                      <FormLabel>1 - I don't have any experience</FormLabel>
                      <FormLabel>5 - I am a sound professional</FormLabel>
                    </div>
                    <Slider
                      className={soundFamiliarity === 0 ? "noAnswer" : ""}
                      onChangeCommitted={(e, value) =>
                        setSoundFamiliarity(value as number)
                      }
                      aria-labelledby="discrete-slider-custom"
                      step={null}
                      min={1}
                      max={5}
                      defaultValue={undefined}
                      marks={[
                        {
                          value: 1,
                          label: "1",
                        },
                        {
                          value: 2,
                          label: "2",
                        },
                        {
                          value: 3,
                          label: "3",
                        },
                        {
                          value: 4,
                          label: "4",
                        },
                        {
                          value: 5,
                          label: "5",
                        },
                      ]}
                    />
                  </div>
                  <br />
                </div>
              </Card>
              {doors.map((door) => (
                <Question
                  key={door.id}
                  onMobile={onMobile}
                  door={door}
                  answered={checkAnswered(door.id)}
                  showErrors={showErrors}
                  setEmotion={(emotion) =>
                    setDoorAnswers({
                      ...doorAnswers,
                      [door.id]: { ...doorAnswers[door.id], emotion },
                    })
                  }
                  setConfidence={(confidence) =>
                    setDoorAnswers({
                      ...doorAnswers,
                      [door.id]: { ...doorAnswers[door.id], confidence },
                    })
                  }
                />
              ))}
              <Card>
                <div className="content-padding">
                  <h2>
                    Do you have anything to add (thougths, comments, etc)?
                  </h2>
                  <div style={{ display: "flex" }}>
                    <TextField
                      id="outlined-multiline-static"
                      multiline
                      rows={4}
                      placeholder="Write your thoughts"
                      variant="outlined"
                      onBlur={(e) => setComment(e.target.value)}
                    />
                  </div>
                  <h2>
                  Do you have any comments about the door materials and their relation to the knocks?
                  </h2>
                  <div style={{ display: "flex" }}>
                    <TextField
                      id="outlined-multiline-static"
                      multiline
                      rows={4}
                      placeholder="Write your thoughts"
                      variant="outlined"
                      onBlur={(e) => setInfluence(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
              <br />
              <Button
                onClick={sendSurvey}
                variant="contained"
                color="primary"
                size="large"
              >
                Send
              </Button>
            </>
          )}
        </div>
      </header>
    </div>
  );
}

export default Survey;
