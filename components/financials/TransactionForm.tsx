import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, ScrollView, Switch } from 'react-native';
import { useFinancials, Transaction, TransactionInsert } from '../../context/FinancialContext';
import { Picker } from '@react-native-picker/picker';
import Svg, { Path } from 'react-native-svg';

interface TransactionFormProps {
    transaction?: Transaction | null;
    onSave: () => void;
    onClose: () => void;
}

// SVG Icons
const ArrowUpIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ArrowDownIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M19 12l-7 7-7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PlusIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onSave, onClose }) => {
    const { accounts, categories, addTransaction, updateTransaction, addAccount, addCategory } = useFinancials();
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState<number | undefined>();
    const [categoryId, setCategoryId] = useState<number | undefined>();
    const [transactionDate, setTransactionDate] = useState(new Date());
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [isCorporate, setIsCorporate] = useState(false);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewAccountInput, setShowNewAccountInput] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountType, setNewAccountType] = useState<'checking' | 'savings' | 'credit_card' | 'investment' | 'cash'>('checking');

    useEffect(() => {
        if (transaction) {
            setIsEditing(true);
            setTitle(transaction.title || '');
            setDescription(transaction.description);
            setNotes(transaction.notes || '');
            setAmount(String(Math.abs(transaction.amount as number)));
            setAccountId(transaction.account_id);
            setCategoryId(transaction?.category_id || undefined);
            setTransactionDate(new Date(transaction.transaction_date));
            setType(Number(transaction.amount) >= 0 ? 'income' : 'expense');
            setIsCorporate(transaction.is_corporate || false);
        } else {
            setIsEditing(false);
            setTitle('');
            setDescription('');
            setNotes('');
            setAmount('');
            setAccountId(accounts.length > 0 ? accounts[0].id : undefined);
            setCategoryId(categories.length > 0 ? categories.find(c => c.type === 'expense')?.id : undefined);
            setTransactionDate(new Date());
            setType('expense');
            setIsCorporate(false);
        }
    }, [transaction, accounts, categories]);

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Atenção', 'O nome da nova categoria não pode ser vazio');
            return;
        }
        try {
            const newCat = await addCategory({
                name: newCategoryName,
                type: type,
            });
            if (newCat && newCat.length > 0) {
                setCategoryId(newCat[0].id);
                setNewCategoryName('');
                setShowNewCategoryInput(false);
            }
        } catch (error: any) {
            Alert.alert('Erro ao Criar Categoria', error.message);
        }
    };

    const handleCreateAccount = async () => {
        if (!newAccountName.trim()) {
            Alert.alert('Atenção', 'Nome da nova conta não pode ser vazio');
            return;
        }
        try {
            const newAcc = await addAccount({
                name: newAccountName,
                currency: 'BRL',
                type: newAccountType,
                is_corporate: false,
                is_public: false,
            });
            if (newAcc && newAcc.length > 0) {
                setAccountId(newAcc[0].id);
                setNewAccountName('');
                setNewAccountType('checking');
                setShowNewAccountInput(false);
            }
        } catch (error: any) {
            Alert.alert('Erro ao Criar Conta', error.message);
        }
    };

    const handleSave = async () => {
        if (!title || !amount || !accountId) {
            Alert.alert('Atenção', 'Título, Valor e Conta são campos obrigatórios');
            return;
        }

        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(numericAmount)) {
            Alert.alert('Erro', 'O valor deve ser um número válido');
            return;
        }

        const finalAmount = type === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

        const transactionData: Omit<TransactionInsert, 'profile_id'> = {
            title,
            description,
            notes,
            amount: finalAmount,
            account_id: accountId,
            category_id: categoryId,
            transaction_date: transactionDate.toISOString(),
            is_corporate: isCorporate,
        };

        try {
            if (isEditing && transaction) {
                await updateTransaction(transaction.id, transactionData);
            } else {
                await addTransaction(transactionData as TransactionInsert);
            }
            onSave();
        } catch (error: any) {
            Alert.alert('Erro ao Salvar', error.message);
        }
    };
    
    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <ScrollView className="flex-1 bg-black">
            <View className="p-6">
                {/* Header */}
                <Text className="text-white text-2xl font-bold mb-8">
                    {isEditing ? 'Editar Transação' : 'Nova Transação'}
                </Text>

                {/* Type Selector */}
                <View className="flex-row mb-8 border border-white/20 rounded-lg overflow-hidden">
                    <TouchableOpacity 
                        onPress={() => setType('expense')} 
                        className={`flex-1 py-4 flex-row items-center justify-center gap-2 ${type === 'expense' ? 'bg-white' : 'bg-transparent'}`}
                    >
                        <ArrowDownIcon size={18} />
                        <Text className={`font-bold ${type === 'expense' ? 'text-black' : 'text-white'}`}>
                            Despesa
                        </Text>
                    </TouchableOpacity>
                    <View className="w-px bg-white/20" />
                    <TouchableOpacity 
                        onPress={() => setType('income')} 
                        className={`flex-1 py-4 flex-row items-center justify-center gap-2 ${type === 'income' ? 'bg-white' : 'bg-transparent'}`}
                    >
                        <ArrowUpIcon size={18} />
                        <Text className={`font-bold ${type === 'income' ? 'text-black' : 'text-white'}`}>
                            Receita
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <View className="mb-6">
                    <Text className="text-white/60 text-sm mb-2">Título</Text>
                    <View className="border border-white/20 rounded-lg">
                        <TextInput
                            className="text-white px-4 py-4 text-base"
                            placeholder="Ex: Conta de Luz"
                            placeholderTextColor="#666666"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>
                </View>

                {/* Amount */}
                <View className="mb-6">
                    <Text className="text-white/60 text-sm mb-2">Valor</Text>
                    <View className="border border-white/20 rounded-lg">
                        <TextInput
                            className="text-white px-4 py-4 text-base"
                            placeholder="0,00"
                            placeholderTextColor="#666666"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                        />
                    </View>
                </View>
                
                {/* Account */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-white/60 text-sm">Conta</Text>
                        <TouchableOpacity 
                            onPress={() => setShowNewAccountInput(!showNewAccountInput)}
                            className="flex-row items-center"
                        >
                            <PlusIcon size={14} />
                            <Text className="text-white text-sm ml-1">
                                {showNewAccountInput ? 'Cancelar' : 'Nova'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showNewAccountInput ? (
                        <View className="border border-white/20 rounded-lg p-4">
                            <TextInput
                                className="text-white px-4 py-3 text-base mb-3 border border-white/20 rounded-lg"
                                placeholder="Nome da nova conta"
                                placeholderTextColor="#666666"
                                value={newAccountName}
                                onChangeText={setNewAccountName}
                            />
                            
                            <Text className="text-white/60 text-xs mb-2">Tipo de Conta</Text>
                            <View className="border border-white/20 rounded-lg overflow-hidden mb-3">
                                <Picker
                                    selectedValue={newAccountType}
                                    onValueChange={(itemValue) => setNewAccountType(itemValue)}
                                    style={{ color: '#FFFFFF', backgroundColor: 'transparent' }}
                                    dropdownIconColor="#FFFFFF"
                                >
                                    <Picker.Item label="Conta Corrente" value="checking" color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                                    <Picker.Item label="Poupança" value="savings" color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                                    <Picker.Item label="Cartão de Crédito" value="credit_card" color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                                    <Picker.Item label="Investimento" value="investment" color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                                    <Picker.Item label="Dinheiro" value="cash" color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                                </Picker>
                            </View>
                            
                            <TouchableOpacity onPress={handleCreateAccount} className="bg-white rounded-lg py-3">
                                <Text className="text-black text-center font-bold text-base">Criar Conta</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="border border-white/20 rounded-lg overflow-hidden">
                            <Picker
                                selectedValue={accountId}
                                onValueChange={(itemValue) => setAccountId(itemValue)}
                                style={{ color: '#FFFFFF', backgroundColor: 'transparent' }}
                                dropdownIconColor="#FFFFFF"
                            >
                                {accounts.map(acc => (
                                    <Picker.Item 
                                        key={acc.id} 
                                        label={`${acc.name}${acc.type ? ' • ' + acc.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}`} 
                                        value={acc.id} 
                                        color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} 
                                    />
                                ))}
                            </Picker>
                        </View>
                    )}
                </View>

                {/* Category */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-white/60 text-sm">Categoria</Text>
                        <TouchableOpacity 
                            onPress={() => setShowNewCategoryInput(!showNewCategoryInput)}
                            className="flex-row items-center"
                        >
                            <PlusIcon size={14} />
                            <Text className="text-white text-sm ml-1">
                                {showNewCategoryInput ? 'Cancelar' : 'Nova'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showNewCategoryInput ? (
                        <View className="border border-white/20 rounded-lg p-4">
                            <TextInput
                                className="text-white px-4 py-3 text-base mb-3 border border-white/20 rounded-lg"
                                placeholder="Nome da nova categoria"
                                placeholderTextColor="#666666"
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                            />
                            <TouchableOpacity onPress={handleCreateCategory} className="bg-white rounded-lg py-3">
                                <Text className="text-black text-center font-bold text-base">Criar Categoria</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="border border-white/20 rounded-lg overflow-hidden">
                            <Picker
                                selectedValue={categoryId}
                                onValueChange={(itemValue) => setCategoryId(itemValue)}
                                style={{ color: '#FFFFFF', backgroundColor: 'transparent' }}
                                dropdownIconColor="#FFFFFF"
                                enabled={filteredCategories.length > 0}
                            >
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map(cat => (
                                        <Picker.Item key={cat.id} label={cat.name} value={cat.id} color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                                    ))
                                ) : (
                                    <Picker.Item label="Nenhuma categoria disponível" value={undefined} color={Platform.OS === 'ios' ? '#FFFFFF' : '#000000'} />
                                )}
                            </Picker>
                        </View>
                    )}
                </View>

                {/* Notes */}
                <View className="mb-6">
                    <Text className="text-white/60 text-sm mb-2">Notas</Text>
                    <View className="border border-white/20 rounded-lg">
                        <TextInput
                            className="text-white px-4 py-4 text-base min-h-[80px]"
                            placeholder="Adicione uma anotação..."
                            placeholderTextColor="#666666"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Corporate Switch */}
                <View className="flex-row items-center justify-between mb-8 p-4 border border-white/20 rounded-lg">
                    <View className="flex-1 mr-4">
                        <Text className="text-white font-medium mb-1">Transação Corporativa</Text>
                        <Text className="text-white/40 text-xs">
                            Marque se for relacionada ao trabalho
                        </Text>
                    </View>
                    <Switch
                        trackColor={{ false: '#333333', true: '#ffffff' }}
                        thumbColor={isCorporate ? '#000000' : '#666666'}
                        ios_backgroundColor="#333333"
                        onValueChange={setIsCorporate}
                        value={isCorporate}
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity onPress={handleSave} className="bg-white rounded-lg py-4 mb-4">
                    <Text className="text-black text-center font-bold text-base">Salvar</Text>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity onPress={onClose} className="py-3">
                    <Text className="text-white/60 text-center text-base">Cancelar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default TransactionForm;