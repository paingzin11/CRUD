import React, { useState, useEffect } from 'react';
 
import { SafeAreaView, Text, View, StyleSheet, Alert, TouchableOpacity, TextInput, FlatList } from 'react-native';
 
import { openDatabase } from 'react-native-sqlite-storage';
 
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
 
import { createStackNavigator } from '@react-navigation/stack';
 
var db = openDatabase({ name: 'SchoolDatabase.db' });
 
function HomeScreen({ navigation }) {
 
  const [S_Name, setName] = useState('');
  const [S_Phone, setPhone] = useState();
  const [S_Address, setAddress] = useState('');
 
  useEffect(() => {
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='Student_Table'",
        [],
        function (tx, res) {
          console.log('item:', res.rows.length);
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS Student_Table', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS Student_Table(student_id INTEGER PRIMARY KEY AUTOINCREMENT, student_name VARCHAR(30), student_phone INT(15), student_address VARCHAR(255))',
              []
            );
          }
        }
      );
    })
 
  }, []);
 
  const insertData = () => {
 
    if (S_Name == '' || S_Phone == '' || S_Address == '') {
      Alert.alert('Please Enter All the Values');
    } else {
 
      db.transaction(function (tx) {
        tx.executeSql(
          'INSERT INTO Student_Table (student_name, student_phone, student_address) VALUES (?,?,?)',
          [S_Name, S_Phone, S_Address],
          (tx, results) => {
            console.log('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              Alert.alert('Data Inserted Successfully....');
            } else Alert.alert('Failed....');
          }
        );
      });
 
    }
  }
 
  navigateToViewScreen = () => {
 
    navigation.navigate('ViewAllStudentScreen');
  }
 
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.mainContainer}>
 
        <Text style={{ fontSize: 24, textAlign: 'center', color: '#000' }}>
          Insert Data Into SQLite Database
        </Text>
 
        <TextInput
          style={styles.textInputStyle}
          onChangeText={
            (text) => setName(text)
          }
          placeholder="Enter Student Name"
          value={S_Name} />
 
        <TextInput
          style={styles.textInputStyle}
          onChangeText={
            (text) => setPhone(text)
          }
          placeholder="Enter Student Phone Number"
          keyboardType={'numeric'}
          value={S_Phone} />
 
        <TextInput
          style={[styles.textInputStyle, { marginBottom: 20 }]}
          onChangeText={
            (text) => setAddress(text)
          }
          placeholder="Enter Student Address"
          value={S_Address} />
 
        <TouchableOpacity
          style={styles.touchableOpacity}
          onPress={insertData}>
 
          <Text style={styles.touchableOpacityText}> Click Here To Insert Data Into SQLite Database </Text>
 
        </TouchableOpacity>
 
        <TouchableOpacity
          style={[styles.touchableOpacity, { marginTop: 20, backgroundColor: '#33691E' }]}
          onPress={navigateToViewScreen}>
 
          <Text style={styles.touchableOpacityText}> Click Here View All Students List </Text>
 
        </TouchableOpacity>
 
      </View>
 
    </SafeAreaView>
  );
};
 
function ViewAllStudentScreen({ navigation }) {
 
  const [items, setItems] = useState([]);
  const [empty, setEmpty] = useState([]);
 
  const isFocused = useIsFocused();
 
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM Student_Table',
        [],
        (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          setItems(temp);
 
          if (results.rows.length >= 1) {
            setEmpty(false);
          } else {
            setEmpty(true)
          }
 
        }
      );
 
    });
  }, [isFocused]);
 
  const listViewItemSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#000'
        }}
      />
    );
  };
 
  const emptyMSG = (status) => {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
 
        <Text style={{ fontSize: 25, textAlign: 'center' }}>
          No Record Inserted Database is Empty...
          </Text>
 
      </View>
    );
  }
 
  const navigateToEditScreen = (id, name, phoneNumber, address) => {
 
    navigation.navigate('EditRecordScreen', {
      student_id: id,
      student_name: name,
      student_phone: phoneNumber,
      student_address: address
    });
  }
 
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {empty ? emptyMSG(empty) :
 
          <FlatList
            data={items}
            ItemSeparatorComponent={listViewItemSeparator}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) =>
              <View key={item.student_id} style={{ padding: 20 }}>
                <TouchableOpacity onPress={() => navigateToEditScreen(item.student_id, item.student_name, item.student_phone, item.student_address)} >
                  <Text style={styles.itemsStyle}> Id: {item.student_id} </Text>
                  <Text style={styles.itemsStyle}> Name: {item.student_name} </Text>
                  <Text style={styles.itemsStyle}> Phone Number: {item.student_phone} </Text>
                  <Text style={styles.itemsStyle}> Address: {item.student_address} </Text>
                </TouchableOpacity>
              </View>
            }
          />
        }
      </View>
    </SafeAreaView>
 
  );
}
 
function EditRecordScreen({ route, navigation }) {
 
  const [S_Id, setID] = useState('');
  const [S_Name, setName] = useState('');
  const [S_Phone, setPhone] = useState();
  const [S_Address, setAddress] = useState('');
 
  useEffect(() => {
 
    setID(route.params.student_id);
    setName(route.params.student_name);
    setPhone(route.params.student_phone.toString());
    setAddress(route.params.student_address);
 
  }, []);
 
  const editData = () => {
 
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE Student_Table set student_name=?, student_phone=? , student_address=? where student_id=?',
        [S_Name, S_Phone, S_Address, S_Id],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            Alert.alert('Record Updated Successfully...')
          } else Alert.alert('Error');
        }
      );
    });
  }
 
  const deleteRecord = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM Student_Table where student_id=?',
        [S_Id],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            Alert.alert(
              'Done',
              'Record Deleted Successfully',
              [
                {
                  text: 'Ok',
                  onPress: () => navigation.navigate('ViewAllStudentScreen'),
                },
              ],
              { cancelable: false }
            );
          }
        }
      );
    });
 
  }
 
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.mainContainer}>
 
        <Text style={{ fontSize: 24, textAlign: 'center', color: '#000' }}>
          Edit Record In SQLite Database
        </Text>
 
        <TextInput
          style={styles.textInputStyle}
          onChangeText={
            (text) => setName(text)
          }
          placeholder="Enter Student Name"
          value={S_Name} />
 
        <TextInput
          style={styles.textInputStyle}
          onChangeText={
            (text) => setPhone(text)
          }
          placeholder="Enter Student Phone Number"
          keyboardType={'numeric'}
          value={S_Phone} />
 
        <TextInput
          style={[styles.textInputStyle, { marginBottom: 20 }]}
          onChangeText={
            (text) => setAddress(text)
          }
          placeholder="Enter Student Address"
          value={S_Address} />
 
        <TouchableOpacity
          style={styles.touchableOpacity}
          onPress={editData}>
 
          <Text style={styles.touchableOpacityText}> Click Here To Edit Record </Text>
 
        </TouchableOpacity>
 
        <TouchableOpacity
          style={[styles.touchableOpacity, { marginTop: 20, backgroundColor: '#33691E' }]}
          onPress={deleteRecord}>
 
          <Text style={styles.touchableOpacityText}> Click Here To Delete Current Record </Text>
 
        </TouchableOpacity>
 
      </View>
 
    </SafeAreaView>
  );
};
 
const Stack = createStackNavigator();
 
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
 
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
 
        <Stack.Screen name="ViewAllStudentScreen" component={ViewAllStudentScreen} />
 
        <Stack.Screen name="EditRecordScreen" component={EditRecordScreen} />
 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
 
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
 
  touchableOpacity: {
    backgroundColor: '#0091EA',
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
 
  touchableOpacityText: {
    color: '#FFFFFF',
    fontSize: 23,
    textAlign: 'center',
    padding: 8
  },
 
  textInputStyle: {
    height: 45,
    width: '90%',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#00B8D4',
    borderRadius: 7,
    marginTop: 15,
  },
 
  itemsStyle: {
    fontSize: 22,
    color: '#000'
  }
});