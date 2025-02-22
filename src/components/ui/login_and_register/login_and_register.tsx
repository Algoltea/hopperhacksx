
              <Button type="submit" className="w-full mt-2 bg-slate-600 hover:bg-slate-700 text-white">
                {isLogin ? "Login" : "Sign Up"}
              </Button>
            </form>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-700">
                {isLogin ? "Need an account?" : "Already have an account?"}{" "}
                <button className="text-slate-600 hover:underline" onClick={toggleForm}>
                  {isLogin ? "Register now" : "Log in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}