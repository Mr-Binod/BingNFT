import React from 'react';
import { testMetaTransaction, checkContractState, checkSignerState } from '../api/TestMetaTransaction';

const TestMetaTransaction = ({ signer, contractMeta }) => {
    const handleTest = async () => {
        console.log('=== Starting MetaTransaction Test ===');
        
        // Check signer state
        await checkSignerState(signer);
        
        // Check contract state
        await checkContractState(contractMeta);
        
        // Test the mint function
        if (signer && contractMeta) {
            const result = await testMetaTransaction(signer, contractMeta);
            if (result.success) {
                alert('✅ MetaTransaction test successful!');
            } else {
                alert('❌ MetaTransaction test failed: ' + result.error);
            }
        } else {
            alert('❌ Signer or ContractMeta is not available');
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
            <h3>Test MetaTransaction</h3>
            <button onClick={handleTest} style={{ padding: '10px', margin: '5px' }}>
                Test contractMeta.mint
            </button>
            <div style={{ marginTop: '10px', fontSize: '12px' }}>
                <p>Signer: {signer ? '✅ Available' : '❌ Not available'}</p>
                <p>ContractMeta: {contractMeta ? '✅ Available' : '❌ Not available'}</p>
                {signer && <p>Signer Address: {signer.address}</p>}
                {contractMeta && <p>Contract Address: {contractMeta.address}</p>}
            </div>
        </div>
    );
};

export default TestMetaTransaction; 