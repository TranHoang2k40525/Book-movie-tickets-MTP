import React, { useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  // State to manage quantities for each product
  const [quantities, setQuantities] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  const products = [
    {
      id: 1,
      name: "BỘ SNACK MINI BROWN & FRIENDS SET",
      price: "569.000 đ",
      description:
        "- 03 ly thiết kế nhân vật Snack Mini Brown & Friends\n- Có ngay 01 Bắp mix lớn và 02 Nước trái cây lớn, kèm 01 snack...",
      image: require("./assets/combo1.png"),
    },
    {
      id: 2,
      name: "NLE MIX&MATCH VALENTINE COMBO",
      price: "299.000 đ",
      description:
        "- 01 Bắp lớn vị tự chọn + 01 Trà vải dâu hạt + 01 Trà việt quất sữa...\n- Tặng 01 Thẻ quà tặng trị giá 50.000 VNĐ...\n- Miễn phí đổi vị thức uống sang Sữa Trà...",
      image: require("./assets/combo2.png"),
    },
    {
      id: 3,
      name: "PREMIUM MY COMBO",
      price: "115.000 đ",
      description:
        "- 1 Bắp lớn + 1 Nước siêu lớn + 1 Snack tùy chọn...\n- Miễn phí đổi vị Caramel, đổi vị phô mai...",
      image: require("./assets/combo3.png"),
    },
    {
      id: 4,
      name: "MY COMBO",
      price: "95.000 đ",
      description:
        "- 1 Bắp ngọt lớn + 1 Nước siêu lớn\n- Có phụ thu tiền thêm khi đổi vị Bắp mix...",
      image: require("./assets/combo4.png"),
    },
    {
      id: 5,
      name: "MTB COMBO",
      price: "125.000 đ",
      description:
        "- 1 Bắp ngọt lớn + 2 Nước siêu lớn\n- Có phụ thu tiền thêm khi đổi vị Bắp mix...",
      image: require("./assets/combo5.png"),
    },
  ];

  // Function to calculate the total price of selected products (excluding base price)
  const calculateProductTotal = () => {
    let total = 0;
    products.forEach((product) => {
      total += parseInt(product.price.replace(/\D/g, "")) * quantities[product.id];
    });
    return total;
  };

  // Function to calculate the final total (base price + product total)
  const calculateTotal = () => {
    const basePrice = 120000; // Giá cơ bản: 120.000 đ
    const productTotal = calculateProductTotal();
    const finalTotal = basePrice + productTotal;
    return finalTotal.toLocaleString() + " đ";
  };

  // Function to handle quantity change
  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(0, prev[id] + delta); // Prevent negative quantities
      return { ...prev, [id]: newQuantity };
    });
  };

  // Handlers for the top bar buttons
  const handleBackPress = () => {
    console.log("Back button pressed");
    // Add navigation logic here (e.g., navigation.goBack())
  };

  const handleMenuPress = () => {
    console.log("Menu button pressed");
    // Add menu logic here (e.g., open a drawer or modal)
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Top Bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 15,
          paddingVertical: 10,
          backgroundColor: "transparent", // Transparent background
          position: "absolute", // Position it above the header
          top: 50, // Push it down by 50px
          left: 0,
          right: 0,
          zIndex: 1, // Ensure it stays on top
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#d70018" /> {/* Red icon */}
          </TouchableOpacity>
          <View style={{ marginLeft: 10 }}>
            <Text style={{ color: "red", fontWeight: "bold", fontSize: 14 }}>
              MTB
              <Text style={{ color: "black", fontWeight: "bold", fontSize: 14 }}>
                {" "}
                Aeon Hà Đông{" "}
              </Text>
            </Text>
            <Text style={{ color: "black", fontSize: 12 }}>
              Cinema 5 23-02-25 20:15-22:30
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleMenuPress}>
          <Ionicons name="menu" size={24} color="#d70018" /> {/* Red icon */}
        </TouchableOpacity>
      </View>

      {/* Main Content (shifted down to avoid overlap) */}
      <ScrollView
        style={{
          marginTop: 100, // Shift the entire content down to account for the top bar
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#d70018",
            padding: 15,
            borderRadius: 10,
            marginHorizontal: 10,
            marginTop: 10, // Small margin to separate from the top
          }}
        >
          <View>
            <Text style={{ color: "white", fontSize: 12, marginTop: 5 }}>
              Áp dụng giá Lễ, Tết cho các sản phẩm bắp nước đối với giao dịch suất chiếu vào ngày Lễ, Tết.
            </Text>
          </View>
        </View>

        {/* Product List */}
        <View style={{ paddingHorizontal: 10 }}>
          {products.map((product) => (
            <View
              key={product.id}
              style={{
                backgroundColor: "#f1e29c",
                borderRadius: 10,
                marginBottom: 10,
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Image
                source={product.image}
                style={{ width: 80, height: 80, borderRadius: 10 }}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>{product.name}</Text>
                <Text style={{ color: "red", fontWeight: "bold", fontSize: 14 }}>
                  {product.price}
                </Text>
                <Text style={{ fontSize: 12, color: "#555", marginTop: 5 }}>
                  {product.description}
                </Text>
                {/* Quantity Selector */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 10,
                    justifyContent: "flex-end",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(product.id, -1)}
                    style={{
                      backgroundColor: "#fff", // Thay đổi màu nền thành trắng
                      borderRadius: 5,
                      padding: 5,
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>-</Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: 16,
                      marginHorizontal: 10,
                      fontWeight: "bold",
                    }}
                  >
                    {quantities[product.id]}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(product.id, 1)}
                    style={{
                      backgroundColor: "#fff", // Thay đổi màu nền thành trắng
                      borderRadius: 5,
                      padding: 5,
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 10,
          backgroundColor: "#fff",
          borderRadius: 10,
          borderTopWidth: 1,
          borderTopColor: "#ddd",
          marginHorizontal: 10,
        }}
      >
        {/* View chứa các Text và ảnh, xếp ngang */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Các Text xếp dọc */}
          <View style={{ flexDirection: "column" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Nhà gia tiên</Text>
            <Text style={{ fontSize: 8, fontWeight: "bold", color: "gray" }}>
              2D Phụ đề anh
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "red" }}>
              {calculateTotal()}
            </Text>
          </View>

          {/* Ảnh nhỏ bên phải */}
          <Image
            source={require("./assets/combo6.png")}
            style={{ width: 45, height: 15, marginLeft: 1 }} // Kích thước nhỏ, cách bên trái 1px
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "#d70018",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 40,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}