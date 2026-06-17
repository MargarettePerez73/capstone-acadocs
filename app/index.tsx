import { Text, View, Image } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Index() {

  const skills = ["SQL", "PHP", "HTML", "React Native", "Bootstrap"];

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start", alignItems: "flex-start", padding: 24, paddingTop: 60, backgroundColor: "#fff",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 30 }}>
        <Image
          source={require("../pictures/1x1.png")}
          style={{ width: 60, height: 60, borderRadius: 30 }}
        />
        <View style={{ marginLeft: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1a1a1a" }}>Margarette M. Perez</Text>
          <Text style={{ fontSize: 16, color: "#808080", marginTop: 2 }}>IT BA-3303</Text>
        </View>
      </View>
      <Text style={{ fontSize: 16, color: "#808080", marginTop: 2, marginBottom: 20, alignItems: "center", }}>"Anything is possible if you try"</Text>

      <View style={{ width: "100%", marginBottom: 30 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <Ionicons name="information-circle-outline" size={24} color="black" />
          <Text style={{ fontSize: 20, fontWeight: "600", marginLeft: 8 }}>About Me</Text>
        </View>
        <Text style={{ fontSize: 15, color: "black", lineHeight: 22 }}>
          Third-year BSIT Business Analytics student at Batangas State University ARASOF-Nasugbu with a foundation in System Integration Architecture, Web 
          Systems Technology, and Systems Architecture Design. Developing technical and analytical skills through academic projects and coursework.        </Text>
      </View>

      <View style={{ width: "100%", marginBottom: 30 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <Ionicons name="mail-outline" size={24} color="black" />
          <Text style={{ fontSize: 20, fontWeight: "600", marginLeft: 8 }}>Contact</Text>
        </View>
        <Text style={{ fontSize: 15, color: "black", lineHeight: 22 }}>
          margaretteperez73@gmail.com</Text>
      </View>
      <View style={{ width: "100%" }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Ionicons name="code-working-outline" size={24} color="black" />
          <Text style={{ fontSize: 20, fontWeight: "600", marginLeft: 8 }}>Skills Matrix</Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {skills.map((skill, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#f0f4f8", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                borderWidth: 1, borderColor: "#dbe3ec"
              }}
            >
              <Text style={{ fontSize: 14, color: "#334e68", fontWeight: "500" }}>{skill}</Text>
            </View>
            
          ))
          
          }
        </View>
      </View>
    </View>
  );
}