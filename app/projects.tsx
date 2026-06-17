import React, { useState } from "react";
import { Text, TouchableOpacity, View, Modal, Image, ScrollView, Dimensions } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const projectImages = {
    CRP: [
        require("../pictures/CRP (1).png"), require("../pictures/CRP (2).png"), require("../pictures/CRP (3).png"),
        require("../pictures/CRP (4).png"), require("../pictures/CRP (5).png"), require("../pictures/CRP (6).png"),
    ],
    Farmart: [
        require("../pictures/Farmart (1).png"), require("../pictures/Farmart (2).png"), require("../pictures/Farmart (3).png"),
        require("../pictures/Farmart (4).png"), require("../pictures/Farmart (5).png"), require("../pictures/Farmart (6).png"),
    ],
    AMB: [
        require("../pictures/AMB (1).png"), require("../pictures/AMB (2).png"), require("../pictures/AMB (3).png"),
        require("../pictures/AMB (4).png"), require("../pictures/AMB (5).png"), require("../pictures/AMB (6).png"),
    ],
};

const projectData: { title: string; key: keyof typeof projectImages }[] = [
    { title: "Commission Rate Project", key: "CRP" },
    { title: "Farmart", key: "Farmart" },
    { title: "AMB Conquerer", key: "AMB" }
];

export default function Projects() {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentImages, setCurrentImages] = useState<any[]>([]);
    const [currentTitle, setCurrentTitle] = useState("");
    const handleOpenProject = (title: string, imageKey: keyof typeof projectImages) => {
        setCurrentTitle(title);
        setCurrentImages(projectImages[imageKey]); // Error ts(7053) is now resolved
        setModalVisible(true);
    };
    return (
        <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 30 }}>
          <Ionicons name="file-tray-full-outline" size={30} color="black" />
          <Text style={{ fontSize: 24, fontWeight: "600", marginLeft: 8, marginBottom: 10 }}>School Projects</Text>
        </View>
            {projectData.map((project, index) => (
                <View key={index} style={{ marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                        <Ionicons name="receipt-outline" size={24} color="black" />
                        <Text style={{ fontSize: 18, paddingLeft: 10, fontWeight: '500' }}>{project.title}</Text>
                    </View>
                    <TouchableOpacity
                        style={{ alignSelf: 'flex-start', backgroundColor: '#f0f0f0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 }}
                        onPress={() => handleOpenProject(project.title, project.key)}
                    >
                        <Text style={{ fontSize: 14, color: '#333' }}>Show Project <Ionicons name="image-outline" color="black" /></Text>
                    </TouchableOpacity>
                </View>
            ))}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '90%', height: '80%', backgroundColor: 'white', borderRadius: 12, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 10 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{currentTitle}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={30} color="red" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{ alignItems: 'center' }} showsVerticalScrollIndicator={false}>
                            {currentImages.map((img, index) => (
                                <Image
                                    key={index}
                                    source={img}
                                    style={{ width: width * 0.8, height: 200, marginBottom: 15, borderRadius: 8, backgroundColor: '#eaeaea' }}
                                    resizeMode="contain"
                                />
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}