import React, { Component } from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components/native";

import LikeIcon from "../assets/like";
import CommentIcon from "../assets/comment";
import MoreIcon from "../assets/more";
import PixelArt from "./PixelArt";
import Icon from "react-native-vector-icons/Ionicons";
import Comment from "./Comment";
import { firebase } from "../firebase/config";

import {
  Text,
  StyleSheet,
  View,
  TextInput,
  Image,
  FlatList,
  Dimensions,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Alert
} from "react-native";

const InputWrapper = styled.View`
  padding: 15px;
  padding-bottom: ${({ insetBottom }) => insetBottom}px;
  position: relative;
  background-color: white;
`;
const Input = styled.TextInput`
  padding: 13px 50px 13px 15px;
  border-radius: 5px;
  border: 1px solid grey;
  margin-bottom: 20px;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 4px 0 2px 0;
  flex: 1;
  padding: 5px 15px 5px 15px;
`;

const Wrapper = styled.View`
  flex: 1;
  flex-direction: column;
  background-color: white;
`;

const TopRow = styled.View`
  flex-direction: row;
  margin: 6px 0 6px 0;
  align-items: center;
  justify-content: flex-start;
`;
const IconLabel = styled.Text`
  font-size: 14px;
  margin-left: 5px;
  font-weight: 500;
  margin-right: 10px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: 400;
`;

const UserName = styled.Text`
  margin-left: 10px;
  font-size: 14px;
  font-weight: 500;
`;

const TimeLabel = styled.Text`
  font-size: 13px;
  font-weight: 400;
  color: #c1c1c1;
`;
const InfosText = styled.Text`
  font-weight: 500;
  font-size: 16px;
  margin: 15px 15px;
  color: grey;
`;

// for (let i = 0; i < 5; i++) {
//   commentsContent.push({
//     id: i,
//     user: "daisy",
//     time: new Date(),
//     text: "dadhsahuaiwhou",
//     userId: "safhsauhaoshaoh",
//   });
// }
const commentsRef = firebase.firestore().collection("comments");
const imagesRef = firebase.firestore().collection("images");
const usersRef = firebase.firestore().collection("users");

export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newComment: "",
      likesCount: this.props.route.params.likesCount,
      islike: this.props.route.params.islike,
      userID:
        this.props.route.params.uid === undefined
          ? 0
          : this.props.route.params.uid,
      itemId:
        this.props.route.params.itemId === undefined
          ? 0
          : this.props.route.params.itemId,
      item:
        this.props.route.params.item === undefined
          ? null
          : this.props.route.params.item,
      commentsCount:
        this.props.route.params.commentsCount === undefined
          ? 0
          : this.props.route.params.commentsCount,
      userName: null,
      commentsContent: []
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  static defaultProps = {};

  onSubmit = e => {
    console.log("on submit");
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const data = {
      itemId: this.state.itemId,
      userID: this.state.userID,
      userName: this.state.userName,
      commentTime: timestamp,
      text: e.nativeEvent.text
    };
    commentsRef
      .add(data)
      //.then(this.setState({ commentsCount: this.state.commentsCount + 1 }))
      .then(
        imagesRef.doc(this.state.itemId).update({
          comments: this.state.commentsContent.length + 1
        })
      );

    // 记得增加对应photo的comments的count
  };

  componentDidMount() {
    // this.setState({
    //   commentsCount: this.state.item.comments,
    // });
    usersRef.where("id", "==", this.state.userID).onSnapshot(
      querySnapshot => {
        //const newEntities = [];
        querySnapshot.forEach(doc => {
          this.setState({ userName: doc.data().fullName });
        });
        console.log(this.state.userName);
        // this.setState({
        //   published: newEntities,
        // });
      },
      error => {
        console.log(error);
      }
    );
    if (this.state.itemId !== 0 && this.state.commentsContent.length === 0) {
      //commentsContent = null;
      commentsRef
        .where("itemId", "==", this.state.itemId)
        .orderBy("commentTime", "desc")
        .onSnapshot(
          querySnapshot => {
            const newEntities = [];
            querySnapshot.forEach(doc => {
              const entity = doc.data();
              entity.id = doc.id;
              newEntities.push(entity);
            });
            this.setState({
              commentsContent: newEntities
            });
            //console.log(commentsContent);
            // this.setState({
            //   published: newEntities,
            // });
          },
          error => {
            console.log(error);
          }
        );
    }
  }

  pressLike = () => {
    this.setState({
      islike: !this.state.islike,
      likesCount: this.state.islike
        ? this.state.likesCount - 1
        : this.state.likesCount + 1
    });
    this.props.route.params.onChangeLike(
      this.props.route.params.item,
      this.state.islike,
      this.state.likesCount
    );
  };

  render() {
    const { item } = this.props.route.params;
    return (
      <Wrapper>
        <Text>{this.state.commentsContent.length}</Text>
        <ScrollView>
          <Row>
            <Image
              source={{
                uri: `https://picsum.photos/id/125/250/250`
              }}
              style={{
                width: 34,
                height: 34,
                borderRadius: 15
              }}
            />
            <UserName>{this.state.userName}</UserName>
          </Row>
          <PixelArt
            data={item.canvasData}
            backgroundColor={item.backGroundColor}
            size={Dimensions.get("window").width}
          />
          <Row>
            <Title>{item.title}</Title>
          </Row>
          <Row
            style={{
              borderColor: "#EBEBEB",
              borderBottomWidth: 1,
              paddingBottom: 16
            }}
          >
            {/* <TimeLabel>{item.publishTime.toString()}</TimeLabel> */}
          </Row>
          <Row>
            <Pressable onPress={e => this.pressLike()}>
              {this.state.islike ? (
                <Icon name="heart" size={25} color="tomato" />
              ) : (
                <Icon name="heart-outline" size={25} />
              )}
            </Pressable>
            <IconLabel>{this.state.likesCount}</IconLabel>
            <CommentIcon width={25} height={25} />
            <IconLabel>{this.state.commentsContent.length}</IconLabel>
          </Row>
          {this.state.commentsContent.length === 0 ? (
            <Row>
              <InfosText>🍻 Come on and be the first one to comment!</InfosText>
            </Row>
          ) : (
            this.state.commentsContent.map((item, i) => (
              <Comment
                key={new Date() + i}
                text={item.text}
                id={this.state.itemId}
                user={item.userName}
                time={item.commentTime}
                userId={item.userID}
              />
            ))
          )}
        </ScrollView>
        <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={70}>
          <InputWrapper insetBottom={30}>
            <Input
              value={this.state.newComment}
              editable={true}
              onChange={e =>
                this.setState({
                  newComment: e.nativeEvent.text
                })
              }
              placeholder={
                this.state.commentsContent.length === 0
                  ? "Add the first comment..."
                  : "Add your comment..."
              }
              returnKeyType="send"
              placeholderTextColor="grey"
              multiline={true}
              maxLength={300}
              blurOnSubmit={true}
              enablesReturnKeyAutomatically={true}
              onSubmitEditing={e => this.onSubmit(e)}
            />
          </InputWrapper>
        </KeyboardAvoidingView>
      </Wrapper>
    );
  }
}
