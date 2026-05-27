import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';

const BareActs = () => {
  const [loading, setLoading] = useState(true);

  // API Data States
  const [bns, setBns] = useState([]);
  const [bnss, setBnss] = useState([]);
  const [bsa, setBsa] = useState([]);
  const [ipc, setIpc] = useState([]);
  const [crpc, setCrpc] = useState([]);
  const [iea, setIea] = useState([]);
  const [cpc, setCpc] = useState([]);
  const [mva, setMva] = useState([]);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchBareActs();
  }, []);

  const fetchBareActs = async () => {
    try {
      const response = await fetch(`${API_BASE}/database/`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log('Response Status:', response.status);

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success) {
        setBns(data.data.bns || []);
        setBnss(data.data.bnss || []);
        setBsa(data.data.bsa || []);
        setIpc(data.data.ipc || []);
        setCrpc(data.data.crpc || []);
        setIea(data.data.iea || []);
        setCpc(data.data.cpc || []);
        setMva(data.data.mva || []);
      } else {
        console.log('No data received');
      }
    } catch (error) {
      console.log('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#2563EB"
        style={styles.loader}
      />
    );
  }

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const toggleSection = (section) => {
    setActiveSection(section);
  };

  const handleSearch = () => {
    const allActs = [
      ...bns,
      ...bnss,
      ...bsa,
      ...ipc,
      ...crpc,
      ...iea,
      ...cpc,
      ...mva,
    ];

    let selectedData = [];

    switch (activeSection) {
      case 'BNS':
        selectedData = bns;
        break;
      case 'BNSS':
        selectedData = bnss;
        break;
      case 'BSA':
        selectedData = bsa;
        break;
      case 'IPC':
        selectedData = ipc;
        break;
      case 'CRPC':
        selectedData = crpc;
        break;
      case 'IEA':
        selectedData = iea;
        break;
      case 'CPC':
        selectedData = cpc;
        break;
      case 'MVA':
        selectedData = mva;
        break;
      default:
        selectedData = allActs;
    }

    const filtered =
      searchQuery.trim() === ''
        ? selectedData
        : selectedData.filter((item) => {
            const query = searchQuery.toLowerCase();
            return (
              item.section_id?.toString().toLowerCase().includes(query) ||
              item.section_title?.toLowerCase().includes(query) ||
              item.description?.toLowerCase().includes(query)
            );
          });

    const uniqueResults = Array.from(
      new Map(
        filtered.map((item) => [
          item.id || `${item.section_id}-${item.section_title}`,
          item,
        ])
      ).values()
    );

    setFilteredResults(uniqueResults);
    setShowResults(true);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Bare Acts Library</Text>

      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.bnsCard}
          onPress={() => toggleSection('BNS')}
        >
          <Text style={styles.bnsCardText}>BNS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bnsCard}
          onPress={() => toggleSection('BNSS')}
        >
          <Text style={styles.bnsCardText}>BNSS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bnsCard}
          onPress={() => toggleSection('BSA')}
        >
          <Text style={styles.bnsCardText}>BSA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bnsCard}
          onPress={() => toggleSection('IPC')}
        >
          <Text style={styles.bnsCardText}>IPC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bnsCard}
          onPress={() => toggleSection('CRPC')}
        >
          <Text style={styles.bnsCardText}>CRPC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bnsCard}
          onPress={() => toggleSection('IEA')}
        >
          <Text style={styles.bnsCardText}>IEA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bnsCard}
          onPress={() => toggleSection('CPC')}
        >
          <Text style={styles.bnsCardText}>CPC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bnsCard}
          onPress={() => toggleSection('MVA')}
        >
          <Text style={styles.bnsCardText}>MVA</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.searchBar}
          placeholder="Search by Section ID or Title"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {showResults && (
        <View style={styles.detailsContainer}>
          {filteredResults.length > 0 ? (
            filteredResults.map((item, index) => (
              <View
                key={`${item.section_id}-${index}`}
                style={styles.card}
              >
                <Text style={styles.label}>Section ID:</Text>
                <Text style={styles.value}>{item.section_id}</Text>

                <Text style={styles.label}>Section Title:</Text>
                <Text style={styles.value}>{item.section_title}</Text>

                <Text style={styles.label}>Description:</Text>
                <Text style={styles.value}>{item.description}</Text>
              </View>
            ))
          ) : (
            <Text
              style={{ textAlign: 'center', marginTop: 20, fontSize: 18 }}
            >
              No results found
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bnsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#00008B',
    height: 160,
    width: 175,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bnsCardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00008B',
    textAlign: 'center',
  },
  detailsContainer: {
    marginTop: 10,
  },
  searchBar: {
    height: 50,
    width: '95%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: '2.5%',
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#1e3a8a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '95%',
    alignSelf: 'center',
  },
  searchButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 5,
  },
  value: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
    marginBottom: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default BareActs;