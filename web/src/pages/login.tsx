import React from 'react';
import { Form, Formik } from 'formik'
import { Box, Button } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { errorMap } from '../utils/errorMaps';
import { useRouter } from 'next/router';

export const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation()

  return (
    <Wrapper variant='small'>
      <Formik 
        initialValues={{username: '', password: ''}} 
        onSubmit={ async (values, { setErrors }) => {
            const response = await login(values);
            console.log(response)
            if(response.data?.login.errors) {
              setErrors(errorMap(response.data.login.errors))
            } else if(response.data?.login.user) {
              router.push('/')
            }
        }}>
        {({isSubmitting}) => {
          return (
            <Form>
              <InputField name="username" placeholder="username" label="Username" />
              <Box mt={4}>
                <InputField name="password" placeholder="password" label="Password" type="password"/>
              </Box>
              <Button 
                mt={4} 
                type="submit" 
                isLoading={isSubmitting} 
                colorScheme="teal">Login</Button>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default Login;
