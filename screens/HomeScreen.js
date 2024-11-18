import { View, Text, SafeAreaView, StatusBar, Image, TextInput, ScrollView } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/solid';
import "../global.css";
import { theme } from '../theme';
import { debounce } from 'lodash'; // Ensure lodash is installed
import { fetchLocations, fetchWeatherForecast } from '../api/weather'; // Ensure these API methods are correctly implemented
import { weatherImages } from '../constants'; // Ensure this file has the correct mapping for weather conditions
import * as Progress from 'react-native-progress'; // Ensure this library is installed
import AsyncStorage from '@react-native-async-storage/async-storage'; // Fix: Add missing import for AsyncStorage

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  // Helper methods for AsyncStorage
  const storeData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.log('Error storing value: ', error);
    }
  };

  const getData = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.log('Error retrieving value: ', error);
    }
  };

  const handleLocation = (loc) => {
    setLocations([]);
    toggleSearch(false);
    setLoading(true);

    fetchWeatherForecast({
      cityName: loc.name,
      days: '7',
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name);
    });
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocations(data);
      });
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city'); // Fix: Changed from `gryData` to `getData`
    let cityName = 'Islamabad';
    if (myCity) cityName = myCity;
    fetchWeatherForecast({
      cityName,
      days: '7',
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather;

  return (
    <View className="flex-1 relative">
      <StatusBar barStyle="light-content" />

      <Image
        blurRadius={50}
        source={require('../assets/images/bg.png')}
        className="absolute h-full w-full"
      />
      {loading ? (
        <View className="flex-1 flex-row justify-center items-center">
          <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
        </View>
      ) : (
        <SafeAreaView className="flex flex-1">
          <View style={{ height: '7%' }} className="mx-4 relative z-50">
            <View
              className="flex-row justify-end items-center rounded-full"
              style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }}
            >
              {showSearch && (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city"
                  placeholderTextColor="lightgray"
                  className="pl-6 h-10 flex-1 pb-1 text-base text-white"
                />
              )}

              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                style={{ backgroundColor: theme.bgWhite(0.3) }}
                className="rounded-full p-3 m-1"
              >
                <MagnifyingGlassIcon size={25} color="white" />
              </TouchableOpacity>
            </View>

            {locations.length > 0 && showSearch && (
              <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                {locations.map((loc, index) => {
                  const showBorder = index + 1 !== locations.length;
                  const borderClass = showBorder ? ' border-b-2 border-b-gray-400' : '';

                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(loc)}
                      key={index}
                      className={`flex-row items-center p-3 px-4 mb-1${borderClass}`}
                    >
                      <MapPinIcon size={20} color="gray" />
                      <Text className="text-black text-lg ml-2">
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View className="mx-4 flex justify-around flex-1 mb-2">
            <Text className="text-white text-center text-2xl font-bold">
              {location?.name}
              <Text className="text-lg font-semibold text-gray-300">
                {' ' + location?.country}
              </Text>
            </Text>
            <View className="flex-row justify-center">
              <Image
                source={weatherImages[current?.condition?.text]}
                className="w-52 h-52"
              />
            </View>
          </View>

          <View className="space-y-2">
            <Text className="text-center font-bold text-white text-6xl ml-5">
              {current?.temp_c}&#176;
            </Text>
            <Text className="text-center text-white text-xl ml-5 tracking-widest">
              {current?.condition?.text}
            </Text>
          </View>

          <View className="flex-row justify-between mx-4">
            <View className="flex-row space-x-2 items-center">
              <Image
                source={require('../assets/icons/wind.png')}
                className="h-6 w-6"
              />
              <Text className="text-white font-semibold text-base">
                {current?.wind_kph}
              </Text>
            </View>
            <View className="flex-row space-x-2 items-center">
              <Image
                source={require('../assets/icons/drop.png')}
                className="h-6 w-6"
              />
              <Text className="text-white font-semibold text-base">
                {current?.humidity}%
              </Text>
            </View>
            <View className="flex-row space-x-2 items-center">
              <Image
                source={require('../assets/icons/sun.png')}
                className="h-6 w-6"
              />
              <Text className="text-white font-semibold text-base">{weather?.forecast?.forecastday[0].astro?.sunrise}</Text>
            </View>
          </View>

          <View className="mb-3 space-y-3">
            <View className="flex-row items-center mx-5 space-x-2">
              <CalendarDaysIcon size={22} color="white" />
              <Text className="text-white text-base">Daily Forecast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
            >
              {weather.forecast?.forecastday?.map((item, index) => {
                let date = new Date(item.date);
                let options = { weekday: 'long' };
                let dayName = date.toLocaleDateString('en-US', options);
                return (
                  <View
                    key={index}
                    className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                  >
                    <Image
                      source={weatherImages[item?.day?.condition?.text]}
                      className="h-11 w-11"
                    />
                    <Text className="text-white">{dayName}</Text>
                    <Text className="text-white text-xl font-semibold">
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
