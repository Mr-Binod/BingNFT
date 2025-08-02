import axios from "axios";
import { AbiCoder, ethers, Wallet } from "ethers";

const sendEntryPoint = async (smartAccCA, EntryPointContract, callData, signer) => {

    const amount = ethers.parseEther("1000", 18);
    const value = ethers.parseEther("0");
    // const mintCallData = Token.interface.encodeFunctionData("mint", [smartAccountAddress, amount]);
    // const callData = smartAccCA.interface.encodeFunctionData("execute",
    //     [smartAccCA, value, mintCallData]
    // )
    const nonce = await EntryPointContract.nonces(smartAccCA)
    const userOp = {
        sender: smartAccCA,
        nonce ,
        initCode: "0x",
        callData,
        callGasLimit: 100000n,
        verificationGasLimit: 100000n,
        preverificationGas: 21000n,
        maxFeePerGas: ethers.parseUnits("5", "gwei"), // 전체 가스 상한을 기본가스비 + 번들러 팁
        maxPrioityFeePerGas: ethers.parseUnits("2", "gwei"), // 번들러에게 주는 가스비
        paymasterAndData: "0x",
        signature: "0x"
    }

    const userOpValues = [
        userOp.sender,
        userOp.nonce,
        userOp.initCode,
        userOp.callData,
        userOp.callGasLimit,
        userOp.verificationGasLimit,
        userOp.preverificationGas,
        userOp.maxFeePerGas,
        userOp.maxPrioityFeePerGas,
        userOp.paymasterAndData,
        userOp.signature
    ]

    const userOpTypes = [
        "address",
        "uint",
        "bytes",
        "bytes",
        "uint",
        "uint",
        "uint",
        "uint",
        "uint",
        "bytes",
        "bytes"
    ]

    const encoded = AbiCoder.defaultAbiCoder().encode(userOpTypes, userOpValues);
    const hash = ethers.keccak256(encoded);
    const signature = await signer.signMessage(ethers.getBytes(hash));
    userOp.signature = signature;

    const userOpTuple = [];
    for (const key in userOp) {
        userOpTuple.push(userOp[key]);
    }
    const userOpToJson = (userop) => {
        const result = {};
        for (const key in userop) {
            const value = userop[key];
            result[key] = typeof value === "bigint" ? value.toString() : value;
        }
        return result;
    }
    const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/userop`,
        userOpToJson(userOp)
    )
    return res
}

export { sendEntryPoint }