#include <stdio.h>
#include <string.h>

void generateKeys(int key[], int k1[], int k2[]);
void encrypt(int plaintext[], int k1[], int k2[], int ciphertext[]);
void decrypt(int ciphertext[], int k1[], int k2[], int plaintext[]);
void printBits(int arr[], int size);

void permute(int in[], int out[], const int table[], int size) {
    int temp[10];
    for (int i = 0; i < size; i++) {
        temp[i] = in[table[i] - 1];
    }
    for (int i = 0; i < size; i++) {
        out[i] = temp[i];
    }
}

void leftShift(int arr[], int numShifts) {
    for (int s = 0; s < numShifts; s++) {
        int first = arr[0];
        for (int i = 0; i < 4; i++) {
            arr[i] = arr[i + 1];
        }
        arr[4] = first;
    }
}

void generateKeys(int key[], int k1[], int k2[]) {
    int p10[10] = {3, 5, 2, 7, 4, 10, 1, 9, 8, 6};
    int p8[8] = {6, 3, 7, 4, 8, 5, 10, 9};
    int temp[10], left[5], right[5], combined[10];

    permute(key, temp, p10, 10);

    for (int i = 0; i < 5; i++) {
        left[i] = temp[i];
        right[i] = temp[i + 5];
    }

    leftShift(left, 1);
    leftShift(right, 1);
    for (int i = 0; i < 5; i++) {
        combined[i] = left[i];
        combined[i + 5] = right[i];
    }
    permute(combined, k1, p8, 8);

    leftShift(left, 2);
    leftShift(right, 2);
    for (int i = 0; i < 5; i++) {
        combined[i] = left[i];
        combined[i + 5] = right[i];
    }
    permute(combined, k2, p8, 8);
}

int sBoxLookup(int row, int col, int sbox[4][4]) {
    return sbox[row][col];
}

void fK(int r[], int subkey[]) {
    int ep[8] = {4, 1, 2, 3, 2, 3, 4, 1};
    int p4[4] = {2, 4, 3, 1};
    int expanded[8], xorOut[8], left[4], right[4];
    
    int s0[4][4] = {
        {1, 0, 3, 2},
        {3, 2, 1, 0},
        {0, 2, 1, 3},
        {3, 1, 3, 2}
    };
    int s1[4][4] = {
        {0, 1, 2, 3},
        {2, 0, 1, 3},
        {3, 0, 1, 0},
        {2, 1, 0, 3}
    };

    permute(r, expanded, ep, 8);

    for (int i = 0; i < 8; i++) {
        xorOut[i] = expanded[i] ^ subkey[i];
    }

    for (int i = 0; i < 4; i++) {
        left[i] = xorOut[i];
        right[i] = xorOut[i + 4];
    }

    int r0 = (left[0] << 1) | left[3];
    int c0 = (left[1] << 1) | left[2];
    int val0 = sBoxLookup(r0, c0, s0);

    int r1 = (right[0] << 1) | right[3];
    int c1 = (right[1] << 1) | right[2];
    int val1 = sBoxLookup(r1, c1, s1);

    int sBoxOut[4];
    sBoxOut[0] = (val0 >> 1) & 1;
    sBoxOut[1] = val0 & 1;
    sBoxOut[2] = (val1 >> 1) & 1;
    sBoxOut[3] = val1 & 1;

    int p4Out[4];
    permute(sBoxOut, p4Out, p4, 4);

    for (int i = 0; i < 4; i++) {
        r[i] = p4Out[i];
    }
}

void encrypt(int plaintext[], int k1[], int k2[], int ciphertext[]) {
    int ip[8] = {2, 6, 3, 1, 4, 8, 5, 7};
    int ipInv[8] = {4, 1, 3, 5, 7, 2, 8, 6};
    int temp[8], left[4], right[4];

    permute(plaintext, temp, ip, 8);

    for (int i = 0; i < 4; i++) {
        left[i] = temp[i];
        right[i] = temp[i + 4];
    }

    int rightCopy[4];
    for (int i = 0; i < 4; i++) rightCopy[i] = right[i];
    fK(right, k1);
    for (int i = 0; i < 4; i++) {
        right[i] = left[i] ^ right[i];
        left[i] = rightCopy[i];
    }

    fK(right, k2);
    for (int i = 0; i < 4; i++) {
        left[i] = left[i] ^ right[i];
    }

    for (int i = 0; i < 4; i++) {
        temp[i] = left[i];
        temp[i + 4] = right[i];
    }

    permute(temp, ciphertext, ipInv, 8);
}

void decrypt(int ciphertext[], int k1[], int k2[], int plaintext[]) {
    int ip[8] = {2, 6, 3, 1, 4, 8, 5, 7};
    int ipInv[8] = {4, 1, 3, 5, 7, 2, 8, 6};
    int temp[8], left[4], right[4];

    permute(ciphertext, temp, ip, 8);

    for (int i = 0; i < 4; i++) {
        left[i] = temp[i];
        right[i] = temp[i + 4];
    }

    int rightCopy[4];
    for (int i = 0; i < 4; i++) rightCopy[i] = right[i];
    fK(right, k2);
    for (int i = 0; i < 4; i++) {
        right[i] = left[i] ^ right[i];
        left[i] = rightCopy[i];
    }

    fK(right, k1);
    for (int i = 0; i < 4; i++) {
        left[i] = left[i] ^ right[i];
    }

    for (int i = 0; i < 4; i++) {
        temp[i] = left[i];
        temp[i + 4] = right[i];
    }

    permute(temp, plaintext, ipInv, 8);
}

void printBits(int arr[], int size) {
    for (int i = 0; i < size; i++) {
        printf("%d", arr[i]);
    }
    printf("\n");
}

int main() {
    int key[10], plaintext[8], ciphertext[8], decryptedtext[8];
    int k1[8], k2[8];

    printf("=== SIMPLIFIED DES (S-DES) ALGORITHM ===\n");
    
    printf("Enter 10-bit key (e.g., 1010000010): ");
    for (int i = 0; i < 10; i++) {
        scanf("%1d", &key[i]);
    }

    printf("Enter 8-bit plaintext (e.g., 10100111): ");
    for (int i = 0; i < 8; i++) {
        scanf("%1d", &plaintext[i]);
    }

    generateKeys(key, k1, k2);
    printf("\n--- Key Generation Results ---\n");
    printf("Subkey 1 (K1): ");
    printBits(k1, 8);
    printf("Subkey 2 (K2): ");
    printBits(k2, 8);

    encrypt(plaintext, k1, k2, ciphertext);
    printf("\nEncrypted Ciphertext: ");
    printBits(ciphertext, 8);

    decrypt(ciphertext, k1, k2, decryptedtext);
    printf("Decrypted Plaintext:  ");
    printBits(decryptedtext, 8);

    return 0;
}