import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './PlaybackBox.scss';

import PlaybackWave from '../PlaybackWave/PlaybackWave';
import SilenceRatio from '../../components/SilenceRatio/SilenceRatio';

import durationFormat from '../../utils/durationFormat';
import {BAR_WIDTH, BAR_GUTTER} from '../../constants/CanvasConstants';
import {SAMPLE_RATE} from '../../constants/AudioConstants';


// const PlaybackBox = ({source, speech, isPlaying, onEnded, onTogglePlay}, context) => {
class PlaybackBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isScrolling: false,
      audioEnded: false
    };
    this.handleEnded = this.handleEnded.bind(this);
    this.setScroll = this.setScroll.bind(this);
    this.handleTogglePlay = this.handleTogglePlay.bind(this);
    this.handleSelectRef = this.handleSelectRef.bind(this);
    this.handleDeleteTrial = this.handleDeleteTrial.bind(this);
    this.handleDownLoad = this.handleDownLoad.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {source, isPlaying} = nextProps;
    if (source !== this.props.source) {
      this.container.scrollLeft = 0;
    }
    if (nextProps.isPlaying && nextProps.isPlaying !== this.props.isPlaying) {
      if (this.props.isEnded) {
        this.container.scrollLeft = 0;
      }
    }
    if (!isPlaying) {
      this.setState({
        isScrolling: false
      });
    }
  }

  handleEnded () {
    const {onEnded} = this.props;
    this.setState({
      isScrolling: false,
      audioEnded: true
    });
    onEnded();
  }

  scrollTo(element, to, duration) {
    const start = element.scrollLeft;
    const change = to - start;
    const increment = 40;
    let currentTime = 0;
    const val = Math.ceil(change * increment / duration);
    const animateScroll = () => {
      currentTime += increment;
      element.scrollLeft = element.scrollLeft + val;
      if (currentTime < duration && this.props.isPlaying) {
        setTimeout(animateScroll, increment);
      }
    };
    animateScroll();
  }


  setScroll (currentTime) {
    if (!this.state.isScrolling) {
      const {speech} = this.props;
      const currentBars = Math.ceil(currentTime * 48000 / SAMPLE_RATE);
      const progressWidth = currentBars * (BAR_WIDTH + BAR_GUTTER);
      const offsetWidth = this.container.offsetWidth;
      const data = speech.buffer.getChannelData(0);
      const canvasWidth = Math.ceil((data.length / SAMPLE_RATE) * (BAR_WIDTH + BAR_GUTTER));
      if (progressWidth > offsetWidth / 2 && canvasWidth > offsetWidth) {
        const timeLeft = (speech.buffer.duration - currentTime) * 1000;
        this.scrollTo(this.container, canvasWidth - offsetWidth, timeLeft * 0.75);
        this.setState({
          isScrolling: true
        });
      }
    }
  }
  handleTogglePlay(e) {
    e.stopPropagation();
    this.props.onTogglePlay();
  }
  handleSelectRef(e) {
    e.stopPropagation();
    this.props.onSelectRef();
  }
  handleDeleteTrial(e) {
    e.stopPropagation();
    this.props.onDeleteTrial();
  }
  handleDownLoad(e) {
    e.stopPropagation();
  }
  render() {
    const {speech, source, isPlaying, isEnded, isSelected, selectedSpeech, category, container} = this.props;
    const duration = speech.buffer.duration * 1000;
    const formatedDuration = durationFormat(duration);

    return (
      <div className="aort-PlaybackBox container">
        <div className="wave-container in-transition" ref={node => this.container = node}>
        {
          isSelected ?
            <PlaybackWave src={source} buffer={speech.buffer} isPlaying={isPlaying && isSelected} isEnded={isEnded} onEnded={this.handleEnded} onTimeProgress={this.setScroll} /> : null
        }
        </div>
        <div className={'columns player-control ' + (isSelected ? 'active' : '')} >
          <div className="column is-one-third level">
            <div className="level-left">
              <div className="level-item">
                  {
                    isSelected ?
                      <button className="button circle-button is-medium" onClick={this.handleTogglePlay}>
                        <span className="icon">
                          {
                            isPlaying ?
                              <i className="fa fa-pause"></i> : <i className="fa fa-play offset-icon"></i>
                          }
                        </span>
                      </button> : null
                  }
              </div>
              <div className="level-item">
                <div>
                  <p>{speech.label}</p>
                  <small>{formatedDuration}</small>
                </div>
              </div>
            </div>
          </div>
          <div className="column is-one-third">
            <SilenceRatio buffer={speech.buffer} index={0} />
          </div>
          {
            container === 'trials' ?
              <div className="column level">
                <div className="level-left"></div>
                <div className="level-right">
                  <div className="level-item buttons has-addons">
                    {
                      category.value === 'mySpeeches' ?
                        <button className={'button ' + (selectedSpeech.trialId === speech.id ? 'is-selected is-primary' : '')} disabled={selectedSpeech && speech.id === selectedSpeech.id} onClick={this.handleSelectRef} >Select as reference</button> : null
                    }
                    <button className={'button'} onClick={this.handleDeleteTrial}>Delete</button>
                    {/*<button className={'button'} disabled={(speech.trialId && speech.trialId === item.id) || (selectedItem && item.id === selectedItem.id)} onClick={onDeleteTrial}>delete</button>*/}
                    <a href={speech.blobURL} onClick={this.handleDownLoad} download={`${speech.label}-${selectedSpeech.label}.mp3`} className="button">Download</a>
                  </div>
                </div>
              </div> : null
          }
        </div>
      </div>
    );
  }
}

PlaybackBox.contextTypes = {
  t: PropTypes.func.isRequired
};
PlaybackBox.propTypes = {};

export default PlaybackBox;