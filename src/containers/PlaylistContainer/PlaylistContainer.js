import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import './PlaylistContainer.scss';
import {selectCategory, selectSpeech, selectUserSpeech, clearSelectedSpeech, saveUserSpeeches, getUserSpeeches} from './actions';
import {selectTrial} from '../TrialsContainer/actions';

import speechList from '../../speech_list.json';
import PlaylistSelect from '../../components/PlaylistSelect/PlaylistSelect';
import PlaylistItems from '../../components/PlaylistItems/PlaylistItems';
import SpeechContent from '../../components/SpeechContent/SpeechContent';
import PlaybackBox from '../../components/PlaybackBox/PlaybackBox';
import NewSpeechForm from '../../components/NewSpeechForm/NewSpeechForm';

class PlaylistContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPlaying: false,
      isEnded: false,
      addNew: false
    };

    this.onSelectChange = this.onSelectChange.bind(this);
    this.onSpeechClick = this.onSpeechClick.bind(this);
    this.handleTogglePlay = this.handleTogglePlay.bind(this);
    this.handleEnded = this.handleEnded.bind(this);
    this.showNewSpeechForm = this.showNewSpeechForm.bind(this);
    this.onNewSpeechSaved = this.onNewSpeechSaved.bind(this);
    this.onNewSpeechCancelled = this.onNewSpeechCancelled.bind(this);
    this.activateTab = this.activateTab.bind(this);
  }

  componentDidMount () {
    this.props.actions.getUserSpeeches();
  }

  onSelectChange (category) {
    if (category && category.value !== this.props.selectedCategory.value) {
      this.props.actions.selectCategory(category);
      this.props.actions.selectTrial(null);
    }
    this.props.onTabSelect(0);
    this.setState({
      isPlaying: false,
      addNew: false
    });
  }

  onSpeechClick (speech) {
    if (this.props.selectedSpeech.label !== speech.label) {
      if (this.props.selectedCategory.value === 'mySpeeches')
        this.props.actions.selectUserSpeech(speech);
      else
        this.props.actions.selectSpeech(speech);

      this.props.actions.selectTrial(null);
    }
    this.setState({
      isPlaying: false,
      addNew: false
    });
  }

  handleTogglePlay() {
    this.setState({
      isPlaying: !this.state.isPlaying,
      isEnded: false
    });
  }

  handleEnded () {
    this.setState({
      isPlaying: false,
      isEnded: true
    });
  }

  showNewSpeechForm () {
    this.setState({
      addNew: true
    });
    this.props.actions.clearSelectedSpeech();
  }

  hideNewSpeechForm () {
    this.setState({
      addNew: false
    });
  }

  onNewSpeechCancelled () {
    this.hideNewSpeechForm();
  }

  onNewSpeechSaved (speech) {
    this.props.actions.saveUserSpeeches(speech, this.props.userSpeeches);
    this.hideNewSpeechForm();
  }

  activateTab () {
    this.props.onTabSelect(1);
  }

  renderPlayBack() {
    const {selectedSpeech} = this.props;
    let source;
    if (selectedSpeech.file_name) {
      source = `./speech_material/${selectedSpeech.file_name}.mp3`;
    }
    else {
      source = selectedSpeech.blobURL;
    }
    if (selectedSpeech.buffer) {
      return (
        <PlaybackBox source={source} speech={selectedSpeech} isPlaying={this.state.isPlaying} isEnded={this.state.isEnded} onEnded={this.handleEnded} onTogglePlay={this.handleTogglePlay} isSelected={true} container={'playlist'} />
      );
    }
  }

  render() {
    const {selectedSpeech, selectedCategory, selectedTrial, userSpeeches} = this.props;
    const translate = this.context.t;
    let options;
    if (userSpeeches.list.length > 0) {
      options = speechList.concat(userSpeeches);
    }
    else options = speechList;
    return (
      <div className="aort-Playlist container">
        <div className="columns">
          {
            !this.state.addNew ?
              <div className="column is-3">
                <PlaylistSelect
                  selectedOption={selectedCategory.value}
                  options={options}
                  placeholder={translate('select-playlist')}
                  onChange={this.onSelectChange} />
                {
                  selectedCategory.list ?
                    <PlaylistItems onClick={this.onSpeechClick} items={selectedCategory.list} selectedItem={selectedSpeech.label} /> : null
                }
                  <div className="level add-wrapper">
                    <div className="level-left"></div>
                    <div className="level-right">
                      <div className="level-item">
                        {
                          selectedCategory.list ? null : <span>or&nbsp;</span>
                        }
                        <a className="button" onClick={this.showNewSpeechForm}>Add a speech</a>
                      </div>
                    </div>
                  </div>
              </div> : null
          }
          {
            selectedSpeech.content && !this.state.addNew ?
              <div className="column">
                <SpeechContent speech={selectedSpeech} />
              </div> : null

          }
          {
            this.state.addNew ?
              <div className="column is-half  is-offset-one-quarter">
                <NewSpeechForm speech={this.state.newSpeech} onSave={this.onNewSpeechSaved} onCancel={this.onNewSpeechCancelled} />
              </div> : null
          }
        </div>
        {
          selectedCategory.value === 'mySpeeches' && !selectedSpeech.trialId ?
            <div className="columns is-centered">
              <div className="column is-one-quarter has-text-centered notification">
                <span>
                  You didn't select a trial as the reference, pick one in <a onClick={this.activateTab} className="has-text-primary">Trials</a>.
                </span>
              </div>
            </div> : null
        }
        {this.renderPlayBack()}
      </div>
    );
  }
}


PlaylistContainer.contextTypes = {
  t: PropTypes.func.isRequired
};

export default connect(
  state => ({
    selectedCategory: state.playlist.selectedCategory,
    selectedSpeech: state.playlist.selectedSpeech,
    selectedTrial: state.trials.selectedTrial,
    userSpeeches: state.playlist.userSpeeches
  }),
  dispatch => ({
    actions: bindActionCreators({
      selectCategory,
      selectSpeech,
      selectUserSpeech,
      clearSelectedSpeech,
      saveUserSpeeches,
      getUserSpeeches,
      selectTrial
    }, dispatch)
  })
)(PlaylistContainer);
